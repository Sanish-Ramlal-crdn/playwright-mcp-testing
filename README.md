## Pywright MCP Testing

<p align="center"><a href="#project-description">Project Description</a> -
<a href="#ui-test-scenarios">UI Test Scenarios</a> -
<a href="#api-test-scenarios">API Test Scenarios</a> - 
<a href="#how-to-run">How To Run</a> 
</p>

## Project Description

The goal of this project is to test various functionalities of the Paywright MCP server to create tests based on prompts and context.

Various UI and API tests will be conducted based on different scenarios

For UI testing, the Practice Software Testing website has been used (Available on:https://practicesoftwaretesting.com/)

For API testing, the Practice Software Testing API has been used (Available on: ttps://github.com/testsmith-io/practice-software-testing)

## UI Test Scenarios

The following scenarios have been tested:

1. **User Authentication**

   - ✅ Valid Login (Enter correct credentials & verify login)

   - ❌ Invalid Login (Enter wrong credentials & validate error message)

2. **Product Purchase Flow**

   - Browse available products

   - Add a product to the cart

   - Verify the cart reflects the correct item

3. **Checkout & Complete Order**

   - Proceed to checkout

   - Enter valid payment details

   - Complete the purchase

   - Verify order confirmation

4. **Invalid Checkout**

   - Attempt checkout with an invalid payment

   - Validate error messages

5. **Multiple Product Order**

   - Add 5+ products to the cart

   - Checkout & verify order summary

## How to Run

Install Node and npm from
https://nodejs.org/en/download/

Ensure that typescript is installed on your machine

```javascript
npm install -g typescript
```

Clone the repository

```javascript
git clone https://github.com/Sanish-Ramlal-crdn/automation-project.git
```

Once you have installed TypeScript, open the project and install Playwright if it's not already installed by running the below command in the project's root in the terminal

```javascript
npm init playwright@latest
```

Now, you can run all the tests at once by typing this command on the terminal of your code editor

```javascript
npx playwright test
```

Or you can choose which test file to run

```javascript
npx playwright test ./tests/ui/[test_file_name].spec.ts
```

You can also select the browser on which to run the tests, else it will run on all 3 browsers by default. For example

Chromium

```javascript
npx playwright test --project=chromium
```

And you can also choose to activate headed mode, as the deault mode is headless

Headed

```javascript
npx playwright test --headed
```

You can view the report after doing a test by running the following command

Report

```javascript
npx playwright show-report
```

You can also run the tests via the Playwright UI

```javascript
npx playwright test --ui
```

For more information, you can visit the official Playwright documentation at:
https://playwright.dev/docs/api/class-playwright

And the official Playwright Git repository: https://github.com/microsoft/playwright
