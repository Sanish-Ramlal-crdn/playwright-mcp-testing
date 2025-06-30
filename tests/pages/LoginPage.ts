import { Page, Locator } from "@playwright/test";
import fs from "fs";
import path from "path";

const urls = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../fixtures/urls.json"), "utf-8")
);

export class AuthPage {
  readonly page: Page;
  readonly signInLink: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly invalidCredentialsText: Locator;
  readonly registerAccountLink: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly dobInput: Locator;
  readonly streetInput: Locator;
  readonly postalCodeInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly countrySelect: Locator;
  readonly phoneInput: Locator;
  readonly registerEmailInput: Locator;
  readonly registerPasswordInput: Locator;
  readonly registerButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signInLink = page.getByRole("link", { name: "Sign in" });
    this.emailInput = page.getByLabel("Email address *");
    this.passwordInput = page.getByLabel("Password *");
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.invalidCredentialsText = page.getByText("Invalid email or password");
    this.registerAccountLink = page.getByRole("link", {
      name: "Register your account",
    });
    this.firstNameInput = page.getByLabel("First name");
    this.lastNameInput = page.getByLabel("Last name");
    this.dobInput = page.getByLabel("Date of Birth *");
    this.streetInput = page.getByLabel("Street");
    this.postalCodeInput = page.getByLabel("Postal code");
    this.cityInput = page.getByLabel("City");
    this.stateInput = page.getByLabel("State");
    this.countrySelect = page.getByLabel("Country");
    this.phoneInput = page.getByLabel("Phone");
    this.registerEmailInput = page.getByLabel("Email address");
    this.registerPasswordInput = page.getByLabel("Password");
    this.registerButton = page.getByRole("button", { name: "Register" });
  }

  async goto() {
    await this.page.goto(urls.home);
  }

  async signIn(email: string, password: string) {
    await this.signInLink.click();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async isInvalidCredentialsVisible() {
    return this.invalidCredentialsText.isVisible();
  }

  async register(user: any) {
    await this.registerAccountLink.click();
    await this.firstNameInput.fill(user.first_name);
    await this.lastNameInput.fill(user.last_name);
    await this.dobInput.fill(user.dob);
    await this.streetInput.fill(user.street);
    await this.postalCodeInput.fill(user.postal_code);
    await this.cityInput.fill(user.city);
    await this.stateInput.fill(user.state);
    await this.countrySelect.selectOption({
      label: "United Kingdom of Great Britain and Northern Ireland (the)",
    });
    await this.phoneInput.fill(user.phone);
    await this.registerEmailInput.fill(user.email);
    await this.registerPasswordInput.fill(user.correct_password);
    await this.registerButton.click();
  }

  async fillLogin(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
