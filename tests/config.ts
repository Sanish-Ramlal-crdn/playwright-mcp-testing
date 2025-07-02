import path from "path";
import fs from "fs";

// Helper to load JSON fixture
function loadFixture<T = any>(relativePath: string): T {
  return JSON.parse(
    fs.readFileSync(path.resolve(__dirname, relativePath), "utf-8")
  );
}

export const products = loadFixture("./fixtures/products.json");
export const user = loadFixture("./fixtures/user.json");
export const apiUser = loadFixture("./fixtures/apiUser.json");
export const invoice = loadFixture("./fixtures/invoice.json");
export const checkout = loadFixture("./fixtures/checkout.json");
export const urls = loadFixture("./fixtures/urls.json");
export const token = (() => {
  try {
    return loadFixture("./fixtures/token.json");
  } catch {
    return undefined;
  }
})();

export default {
  products,
  user,
  apiUser,
  invoice,
  checkout,
  urls,
  token,
};
