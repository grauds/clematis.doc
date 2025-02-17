---
sidebar_position: 3
tags:
  - jest
  - testing-library
---

# Pomodoro And Jest

Pomodoro doesn't use [Enzyme](https://enzymejs.github.io/enzyme/), since
Enzyme library is [discontinued](https://dev.to/wojtekmaj/enzyme-is-dead-now-what-ekl),
the official replacement for it is
[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

## Installation

There are a few dependencies which have to be installed for
Jest and React Testing Library:

````json title="package.json"
{
  "devDependencies": {
    "@testing-library/dom": "^8.20.1",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^12.1.5",
    "@testing-library/react-hooks": "^8.0.1",
    "@types/jest": "^29.5.11",
    "@types/redux-mock-store": "^1.0.4",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}

````
Since Pomodoro is Webpack based, it is required to 
have paths resolving added to its configuration:

````javascript title="cfg/webpack.(server|client).config.js"
module.exports = {
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      'react-dom': IS_DEV
      ?
      '@hot-loader/react-dom': 'react-dom',
      '@/*': path.resolve(__dirname,
      '../src/*'
      )
    }
  }
}
````
Also, the same for Jest configuration, along with some 
mocks for files:

````javascript title="jest.config.js"
{ 
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/scripts/fileMock.js',
    '^@/(.*)$': ['<rootDir>/src/$1']
  }
}
````

## A Shallow Test

Pomodoro uses Redux to store much of the application data, however there is a number of plain components using
properties. Tests are just checking these components can be rendered. The same can be checked for more complex
components:

````typescript jsx title="src/shared/Statistics/FocusTotals/FocusTotals.test.tsx"
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FocusTotals } from './FocusTotals';

import styles from './focustotals.css';

describe('FocusTotals', () => {
    it('renders without crashing', () => {
        const {container} = render(<FocusTotals />);
        expect(container).toBeInTheDocument();
    });
})
````
The key function is `render` which writes the component being tested to virtual 
DOM returning the object which can be used in the tests.

## Testing Styles

Components are being decorated differently, depending on their data, and this can be validated in tests,
for example:

````typescript jsx title="src/shared/Statistics/FocusTotals/FocusTotals.test.tsx"

it('applies active class when percent is greater than 0', () => {
    const { container } = render(<FocusTotals percent={50} />);
    expect(container.firstChild).toHaveClass(styles.active);
});

it('does not apply active class when percent is 0 or less', () => {
    const { container } = render(<FocusTotals percent={0} />);
    expect(container.firstChild).not.toHaveClass(styles.active);
});

````

## Dynamic Text Correctness

For text which only visible on runtime it is useful to create a simple test to check some of the cases:

````typescript jsx title="src/shared/Statistics/DayTotals/DayTotals.test.tsx"
const mockDay: IDayStats = {
    name: "Monday",
    date: new Date("2023-10-10"),
    time: 120,
    pause: 10,
    break: 5,
    stops: 2,
    short: '1',
};
  
it("should render the day name and date correctly", () => {
    const { getByText } = render(<DayTotals day={mockDay} time="120" />);
    expect(getByText("Monday (10/10/2023)")).toBeInTheDocument();
});
````

## User Interaction With A Form

Pomodoro uses `@testing-library/react` to fire user clicks and do some
typing in the input fields of components being tested:

````typescript jsx title="src/shared/Main/AddTaskForm/AddTaskForm.test.tsx"
import { render, screen, fireEvent } from '@testing-library/react';

test('shows error message if task name is less than 3 characters', () => {
    render(<AddTaskForm onSubmit={jest.fn()} />);
    const input = screen.getByPlaceholderText('Название задачи');
    const button = screen.getByText('Добавить');

    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.click(button);

    expect(screen.getByText('Введите не меньше трех символов для новой задачи')).toBeInTheDocument();
});
````

## 