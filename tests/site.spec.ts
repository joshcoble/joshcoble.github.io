import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const WIDTHS = [375, 768, 1280]

async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((top) => window.scrollTo(0, top), y)
    await page.waitForTimeout(60)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
}

for (const width of WIDTHS) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } })

    test('has no axe violations (WCAG 2.2 A and AA)', async ({ page }) => {
      await page.goto('/')
      await scrollThrough(page)
      await page.waitForTimeout(2500) // let reveal animations finish before checking contrast
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze()
      const summary = results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s), ${v.help}`)
      expect(summary).toEqual([])
    })

    test('does not scroll sideways', async ({ page }) => {
      await page.goto('/')
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(overflow).toBeLessThanOrEqual(0)
    })
  })
}

test('every tab stop shows a visible focus outline', async ({ page }) => {
  await page.goto('/')
  const total = await page.evaluate(
    () => document.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])').length,
  )
  const seen = new Set<string>()
  for (let i = 0; i < total; i++) {
    await page.keyboard.press('Tab')
    const focus = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null
      if (!el || el === document.body) return null
      const style = getComputedStyle(el)
      const visible = el.closest('dialog:not([open])') === null
      return {
        key: `${el.tagName}|${el.getAttribute('href') ?? ''}|${el.textContent?.trim().slice(0, 40)}`,
        outline: style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2,
        visible,
      }
    })
    if (!focus) continue
    expect(focus.visible, `${focus.key} is inside a closed dialog`).toBe(true)
    expect(focus.outline, `${focus.key} has no visible focus outline`).toBe(true)
    seen.add(focus.key)
  }
  expect(seen.size).toBeGreaterThan(40)
})

test('skip link is the first tab stop and jumps to the register', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to the register' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeInViewport()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#register$/)
  await expect(page.locator('#register h2')).toBeInViewport()
})

test('a goal is reachable from the register and its file opens in one more click', async ({ page }) => {
  await page.goto('/')
  await page.locator('.register').getByRole('link', { name: /Foundations in cybersecurity governance/ }).click()
  await expect(page).toHaveURL(/#goal-2$/)
  const fileLink = page.locator('#goal-2').getByRole('link', { name: /essential-eight-summary\.pdf/ })
  await expect(fileLink).toBeInViewport()
  await expect(fileLink).toHaveAttribute('href', '/evidence/essential-eight-summary.pdf')
})

test('every evidence link resolves with the right content type', async ({ page, request }) => {
  await page.goto('/')
  const hrefs = await page.$$eval('a[href^="/evidence/"]', (links) => [
    ...new Set(links.map((a) => a.getAttribute('href')!)),
  ])
  expect(hrefs.length).toBe(12)
  const types: Record<string, string> = { pdf: 'application/pdf', png: 'image/png' }
  for (const href of hrefs) {
    const res = await request.get(href)
    expect(res.status(), href).toBe(200)
    expect(res.headers()['content-type'], href).toContain(types[href.split('.').pop()!])
  }
  const thumbs = await page.$$eval('img[src^="/thumbs/"]', (imgs) => imgs.map((i) => i.getAttribute('src')!))
  for (const src of thumbs) expect((await request.get(src)).status(), src).toBe(200)
})

test('screenshot dialog opens, traps focus and returns it on Escape', async ({ page }) => {
  await page.goto('/')
  const thumb = page.locator('#goal-3 .thumb-link').first()
  await thumb.click()
  const dialog = page.locator('dialog[open]')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(thumb).toBeFocused()
})

test('reduced motion shows every figure in its final state', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/')
  await expect(page.locator('html')).not.toHaveClass(/motion-ok/)
  // Nothing pins, and the pipeline shows real results rather than a queue
  await expect(page.locator('#goal-3 .chapter-pin')).not.toHaveCSS('position', 'sticky')
  await expect(page.locator('.stage[data-result="failure"] .stage-label').first()).toBeVisible()
  // The diff and the finale are drawn in full straight away
  await expect(page.locator('#goal-1 .diff-line--now').first()).toHaveCSS('opacity', '1')
  await expect(page.locator('.finale-head').first()).toHaveCSS('opacity', '1')
  await expect(page.locator('.finale-lane').first()).not.toHaveCSS('stroke-dashoffset', '1px')
  await context.close()
})

test('the page is complete without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('Joshua Coble')
  await expect(page.locator('article.chapter')).toHaveCount(4)
  await expect(page.locator('#evidence-index a[href^="/evidence/"]')).toHaveCount(12)
  // Without JS the inline script never adds motion-ok, so no figure is left at its first frame.
  // Reflections are expanded and every stage shows its result
  await expect(page.locator('#goal-1 .merge-more p').first()).toBeVisible()
  await expect(page.locator('.stage-label').first()).toHaveText('Failed')
  // The thinking diffs and the finale are in the HTML; the canvas and the shell need scripts, so neither is there
  await expect(page.locator('#goal-4 .diff-line--was').first()).toBeVisible()
  await expect(page.locator('.finale-summary')).toHaveText('All four goals merged into main.')
  await expect(page.locator('canvas.network, #shell-input')).toHaveCount(0)
  // Every skill is listed and its reasoning opens with no script
  await expect(page.locator('#skills .skill')).toHaveCount(9)
  await page.locator('#skills summary').first().click()
  await expect(page.locator('#skills .skill-why').first()).toBeVisible()
  await context.close()
})

test('the screenshot viewer steps with the arrow keys and closes back to its thumbnail', async ({ page }) => {
  await page.goto('/')
  const thumb = page.locator('#goal-3 .thumb-link').first()
  await thumb.focus()
  await page.keyboard.press('Enter')
  const dialog = page.locator('dialog[open]')
  await expect(dialog).toBeVisible()
  const image = dialog.locator('img').first()
  const first = await image.getAttribute('src')
  await page.keyboard.press('ArrowRight')
  await expect(image).not.toHaveAttribute('src', first!)
  await page.keyboard.press('ArrowLeft')
  await expect(image).toHaveAttribute('src', first!)
  await dialog.getByRole('button', { name: 'Close' }).press('Enter')
  await expect(dialog).toHaveCount(0)
  await expect(thumb).toBeFocused()
})

test('the skills audit filters by group and explains each level', async ({ page }) => {
  await page.goto('/')
  const skills = page.locator('#skills .skill')
  await expect(skills).toHaveCount(9)
  const goalsOnly = page.getByRole('button', { name: /Goals this session/ })
  await goalsOnly.click()
  await expect(goalsOnly).toHaveAttribute('aria-pressed', 'true')
  await expect(skills).toHaveCount(4)
  const methodology = skills.filter({ hasText: 'Project delivery methodology' })
  await methodology.locator('summary').focus()
  await page.keyboard.press('Enter')
  await expect(methodology.getByText(/observational and instruction-led/)).toBeVisible()
  await methodology.getByRole('link', { name: 'G4 Delivery methodology' }).click()
  await expect(page).toHaveURL(/#goal-4$/)
})

test.describe('the hero shell', () => {
  test('answers help, rejects unknown commands and recalls history', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox', { name: /Terminal command/ })
    await input.fill('help')
    await input.press('Enter')
    const log = page.getByRole('log', { name: 'Terminal output' })
    await expect(log).toContainText('jump to a goal')
    await input.fill('rm -rf /')
    await input.press('Enter')
    await expect(log).toContainText('command not found: rm')
    await input.press('ArrowUp')
    await expect(input).toHaveValue('rm -rf /')
    await input.press('ArrowUp')
    await expect(input).toHaveValue('help')
    await input.fill('clear')
    await input.press('Enter')
    await expect(log).toHaveCount(0)
  })

  test('open g3 jumps to the chapter and moves focus to its heading', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox', { name: /Terminal command/ })
    await input.fill('open g3')
    await input.press('Enter')
    await expect(page).toHaveURL(/#goal-3$/)
    const heading = page.locator('#goal-3 h2')
    await expect(heading).toBeFocused()
    await expect(heading).toBeInViewport()
  })

  test('evidence lists every file as a link', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox', { name: /Terminal command/ })
    await input.fill('evidence')
    await input.press('Enter')
    await expect(page.getByRole('log').locator('a[href^="/evidence/"]')).toHaveCount(12)
    const results = await new AxeBuilder({ page })
      .include('.term')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze()
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })
})
