---
sidebar_position: 5
tags:
  - cucumber
  - playwright
  - jenkins
---

# Cucumber And Playwright

The first step is to have Cucumber and [Playwright](https://playwright.dev/) installed in the project:

````json title="package.json"
{
  "devDependencies": {
    "@cucumber/cucumber": "^11.2.0",
    "@playwright/test": "^1.47.2",
    "ts-node": "^10.9.2"
  }
}
````

The next step is to install/update Playwright collection of browsers:

````bash
npx playwright install
````
Now everything is ready to create steps to bind Cucumber features and their scenarios to Playwright tests.

## A Folder For Tests

It is convenient to have another root folder for tests with all the initial subfolders:

````
tests
 ├─ features
 ├─ steps
 │ ...
cucumber.js
````

## Cucumber Configuration

We also add a [Cucumber configuration](https://github.com/cucumber/cucumber-js/blob/HEAD/docs/configuration.md#finding-your-features)
file at the root of the project, like below:

````javascript title="cucumber.js"
module.exports = {
    default: {
        paths: [
            'tests/features/**/*.{feature,feature.md}'
        ],
        require: [
            'tests/steps/**/*.ts'
        ],
        requireModule: [
            'ts-node/register'
        ],
        format: ['progress', ['html', 'cucumber-report.html']],
        timeout: 60000,
    },
};
````
Also, a basic command is added to `package.json` to launch the testing:

````json title="package.json"
{
  "scripts": {    
    "cucumber": "npx cucumber-js"
  }
}
````

## Testing A Feature

A feature (example for Pomodoro) is described used Gherkin notation during collection of requirements from 
a customer/stakeholder. Next, the file is put into the `features` folder:

````gherkin title="tests/features/create-new-task.feature"
Feature: Create new task
  Scenario: Test - Create new task
    Given HomePage open page
    Given HomePage has a form NewTask
    Given NewTask form has a text field
    Given NewTask form has a submit button
    Then User provides the name for the new task "Test"
    And User clicks the submit button
    When A new task is created
    And The new task is displayed in the list
````

Next step is to create a function for every line of the description and put it into 
another file in `steps` directory. Here is the full text of the example test 
scenario:

````typescript title="tests/steps/create-new-task-steps.ts"
import { AfterAll, BeforeAll, Given, Then, When } from '@cucumber/cucumber';
import { chromium, expect, Browser, BrowserContext, Page } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { testUrl } from '../constants';

let browser: Browser;
let context: BrowserContext;
let page: Page;
let homePage: HomePage;

BeforeAll(async () => {
  browser = await chromium.launch({ headless: false });
  context = await browser.newContext();
  page = await context.newPage();
  homePage = new HomePage(page);
})

AfterAll(async () => {
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
});

Given('HomePage open page', async function() {
  await homePage.navigateTo(testUrl)
});

Given('HomePage has a form NewTask', function () {
  expect(page.getByRole('form')).toBeTruthy();
});

Given('NewTask form has a text field', async function () {
  expect(page.getByPlaceholder('Название задачи')).toBeTruthy();
});

Given('NewTask form has a submit button', async function () {
  expect(page.getByPlaceholder('Добавить')).toBeTruthy();
});

Then('User provides the name for the new task {string}',
  async function (taskName: string) {

  await page.getByPlaceholder('Название задачи').click();
  await page.getByPlaceholder('Название задачи').fill(taskName);
});

Then('User clicks the submit button', async function () {
  await page.getByRole('button', { name: 'Добавить' }).click();
});

When('A new task is created', async function () {
  await expect(page.getByText('Test 🍅 ')).toBeVisible();
});

When('The new task is displayed in the list', async function () {
  await expect(page.getByText('Test 🍅 ')).toBeVisible();
});

````
It is important to follow textual descriptions in the tests, `cucumber-js` will
throw an error otherwise.

Playwright is starting its part inside the tests functions, providing jest-like 
syntax and validating the elements and their content.

## Classes For Playwright

The example above uses page classes, created for the tests only. It is convenient 
to have one base class with base search functions in it plus more classes for 
the other pages. For example:

````typescript title="tests/pages/AbstractPage.ts"
import { Page } from '@playwright/test';

export abstract class AbstractPage {

  // a page from Playwright
  protected page: Page;

  private static BASIC_XPATH = {
    heading: "//h2[text()='%s']",
    label: "//label[text()='%s']"
  }

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(url: string) {
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
    });
  }

  async findElement(selector: string) {
    await this.page.waitForSelector(selector);
  }

  async verifyElementExists(selector: string) {
    try {
      await this.page.waitForSelector(selector,
        {
          state: 'visible',
          timeout: 5000
        });
      return this.page.locator(selector);
    } catch (error) {
      throw new Error(`Unable to verify element with selector "${selector}", not found: ${error}`);
    }
  }

  async enterText(selector: string, text: string) {
    await this.verifyElementExists(selector)
    await this.page.fill(selector, text);
  }
  // ... more functions specific to the basic page search 
}
````
While another class for the real home page would be like:

````typescript title="tests/pages/HomePage.ts"
import { AbstractPage } from './AbstractPage';

export class HomePage extends AbstractPage {

  private static HOME_PAGE_XPATH = {
    newTaskNameInput: "input[name='']"
  }

  async enterTaskName(taskName: string) {
    await this.enterText(HomePage.HOME_PAGE_XPATH.newTaskNameInput, taskName);
  }
 // ... more functions specific to the home page
}
````
With more and more tests covering all the aspects of the application, the number
of functions needed will grow fast. This class hierarchy reflects the hierarchy of 
pages in the application and allows to re-use testing code.

## Test Reports

Clematis projects prefer reports compatible with Jenkins, so in
this case it would be sensible to have it in JSON format.

The following line in the Cucumber configuration file is responsible 
for this:

````json lines
{
  format: [    
    [
      'html',
      'cucumber-report.html'
    ]
  ]
}
````
Jenkins will need [Cucumber reports](https://plugins.jenkins.io/cucumber-reports/)
plugin installed to display the results.