## Playwright MCP Testing

<p align="center"><a href="#project-description">Project Description</a> -
<a href="#about-the-mcp">About the MCP</a> -
<a href="#ui-test-scenarios">UI Test Scenarios</a> -
<a href="#api-test-scenarios">API Test Scenarios</a> - 
<a href="#how-to-run">How To Run</a> 
</p>

## Project Description

The goal of this project is to test various functionalities of the Playwright MCP server to create tests based on prompts and context.
All of the tests created in this project have been created using the Playwright MCP only, in order to fully test its capabilities.

Various UI and API tests have been conducted based on different scenarios

For UI testing, the Practice Software Testing website has been used (Available on: https://practicesoftwaretesting.com/)

For API testing, the Practice Software Testing API has been used (Available on: https://github.com/testsmith-io/practice-software-testing)

## About the MCP

Playwright MCP is a powerful tool designed for browser automation, built on Claude’s Model Context Protocol (MCP). It allows testers to automate browser actions and API calls using plain English commands by making use of LLMs, such as GPT and Claude.

For more information about the MCP installation and how to use it, please refer to the official Playwright MCP GitHub Repo, available on: https://github.com/microsoft/playwright-mcp

I also highly recommend watching this video in order to get a deeper understanding on how to use the Playwright MCP: https://www.youtube.com/watch?v=paSwmp-z9wc

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

## API Test Scenarios

The following scenarios have been tested:

1. **Authentication**

   - Register a user (POST /users/register)

   - Login a user (POST /users/login)

   - Validate token is returned and can be reused

2. **Product Catalog**

   - Get list of products (GET /products)

   - Get product by ID (GET /products/:id)

   - Search for a Product

3. **Cart Operations**

   - Add item to cart (POST /cart)

   - Get cart (GET /cart)

   - Remove item from cart (DELETE /cart/:itemId)

4. **Order Processing**

   - Place an order (POST /orders)

   - Get order history (GET /orders)

   - Get order by ID (GET /orders/:id)

5. **Negative Testing**

   - Send invalid login credentials

   - Access a protected endpoint with an invalid or missing token

   - Try ordering with an empty cart

## How to Run the tests

Install Node and npm from
https://nodejs.org/en/download/

Ensure that typescript is installed on your machine

```javascript
npm install -g typescript
```

Clone the repository

```javascript
git clone https://github.com/Sanish-Ramlal-crdn/playwright-mcp-testing.git
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
npx playwright test ./tests/[folder_name]/[test_file_name]
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
