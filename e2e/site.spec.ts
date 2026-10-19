import { test, expect } from "@playwright/test";

// Site público: caminhos da página inicial, links, responsividade e páginas legais.
const PAGES = ["/index.html", "/para-estabelecimentos.html", "/para-clientes.html", "/privacidade.html", "/termos.html"];

test("página inicial: 'Contratar o serviço' leva à contratação e 'Conhecer a ferramenta' ao app", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Contratar o serviço").click();
  await expect(page).toHaveURL(/para-estabelecimentos\.html$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("pedidos");

  await page.goto("/");
  await page.getByText("Conhecer a ferramenta").click();
  await expect(page).toHaveURL(/para-clientes\.html$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Muita Fome");
});

test("contratação: passo a passo, plano e chamadas para o cadastro do painel", async ({ page }) => {
  await page.goto("/para-estabelecimentos.html");
  await expect(page.locator("#como-contratar li")).toHaveCount(4);
  await expect(page.locator("#plano")).toContainText("Plano mensal");
  // Em desenvolvimento os links do painel apontam para o Next local.
  const cadastro = page.locator("[data-painel='/cadastro']");
  expect(await cadastro.count()).toBeGreaterThanOrEqual(3);
  for (const href of await cadastro.evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href))) {
    expect(href).toBe("http://localhost:3000/cadastro");
  }
});

test("clientes: 'Pedir agora' aponta para o cliente web", async ({ page }) => {
  await page.goto("/para-clientes.html");
  const links = await page.locator("[data-app]").evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href));
  expect(links.length).toBeGreaterThanOrEqual(2);
  expect(links.every((h) => h === "http://localhost:3001/")).toBe(true);
});

test("nenhum link interno quebrado", async ({ page, request }) => {
  const checked = new Set<string>();
  for (const path of PAGES) {
    await page.goto(path);
    const hrefs = await page.locator("a[href]").evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href));
    for (const href of hrefs) {
      const url = new URL(href);
      if (url.origin !== new URL(page.url()).origin || checked.has(url.pathname)) continue; // externos e repetidos
      checked.add(url.pathname);
      expect((await request.get(url.pathname)).status(), `link quebrado em ${path}: ${url.pathname}`).toBe(200);
    }
    for (const src of await page.locator("img[src]").evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src))) {
      expect((await request.get(new URL(src).pathname)).status(), `imagem quebrada em ${path}`).toBe(200);
    }
  }
});

test("nenhuma página rola para os lados num celular de 360 px", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true });
  const page = await context.newPage();
  for (const path of PAGES) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `rolagem horizontal em ${path}`).toBeLessThanOrEqual(0);
  }
  await context.close();
});

test("política de privacidade tem as seções exigidas pela LGPD", async ({ page }) => {
  await page.goto("/privacidade.html");
  for (const section of ["Quem é o controlador", "Que dados tratamos", "Com quem compartilhamos", "Por quanto tempo", "Seus direitos", "Como protegemos"]) {
    await expect(page.getByRole("heading", { name: new RegExp(section) })).toBeVisible();
  }
  await expect(page.getByText("Encarregado (DPO)")).toBeVisible();
});

test("toda página tem título, idioma pt-BR, descrição e rodapé com os links legais", async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    expect(await page.title(), path).not.toBe("");
    expect(await page.getAttribute("html", "lang")).toBe("pt-BR");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator("footer").getByRole("link", { name: "Política de Privacidade" })).toBeVisible();
    await expect(page.locator("footer").getByRole("link", { name: "Termos de Uso" })).toBeVisible();
  }
});
