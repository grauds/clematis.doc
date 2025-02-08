---
sidebar_position: 2
tags:
  - wireframes
  - gherkin
  - balsamiq
  - figma
  - cucumber
---

# Wireframes

## Agile User Stories

The first and the most important part of the development process is requirements definition:  
collecting information from stakeholders, analyzing and validating it to define what 
users can do with the software and how the software should behave. 

The goal of any development is to have a product that allow
users to accomplish their tasks. But obviously, there is no straight line between the plain
language [user stories](https://en.wikipedia.org/wiki/User_story) and the final product's specification. 
[Agile User Stories](https://www.atlassian.com/agile/project-management/user-stories#) make this gap
less wide, they focus on user needs and are short by definition, 
unlike full functional specification documents.

Requirements definition process should then produce a number of agile user stories.

## Low Fidelity Wireframes

...are helpful to quickly start the conversation among end users and developers. 
It is usually enough to sketch a layout roughly, quickly add, change or delete details, let anyone 
participate in the discussion and focus on the functionality. Tools like [Balsamiq](https://balsamiq.com/)
are quite good in this.

## Behaviour-Driven Development

Collaboration over low-fi wireframes and further development are most productive if followed 
[Behaviour-Driven Development (BDD)](https://cucumber.io/docs/bdd/) principles:
 
1. Make changes to wireframes, system design and the code itself in small iterations, get feedback from the end-users.
2. Produce acceptance criteria for every user story and make it automatically validatable every build.

:::tip[]
It is implied that end-users are making new feature requests during the whole software system life cycle,
way beyond it release date, until it reached EOL. The BDD process doesn't stop once the first design is ready
and the development is started.
:::

## Acceptance Criteria In Gherkin Notation

Agile user stories are still plain text, so it would be nice to talk through a more formal way to validate
functionality before breaking down the story into the technical tasks. There is a special 
[Gherkin](https://cucumber.io/docs/gherkin/reference#steps) notation for doing that:

````gherkin
Feature: Listening to the music
  Background: 
      Given an audio amplifier
      And a couple of speakers
      And a vinyl record player
  Scenario:  
      Given a vinyl record
      When I put the record on the turntable
      Then I should hear the music
      Then I shouldn't listen to the silence  
````
Then these criteria may be used at the later stage to start making tests with [Cucumber](https://cucumber.io/docs).
Surely, there are no any working systems to test at this stage, however, it is a good idea to let tests go
first, before the implementation, as described in [Test Driven Development](https://cucumber.io/blog/bdd/intro-to-bdd-and-tdd/)
practice. The result would be the Cucumber based
[steps definitions](https://cucumber.io/docs#what-are-step-definitions).


## High Fidelity Wireframes

At some later stage, when 80% of the design is done in low-detail, it is required to make realistic, 
pixel-perfect wireframes, which also should be approved by the stakeholders. They contain:

1. Responsive layouts of every page for every standard screen size.
2. Colours and fonts in all possible themes.
3. CSS describing borders, shadows, sounds
4. SVG icons
5. Data formatting

## Snapshot Testing

The styles are exported during development and the look-and-feel of the final product closely follows these
hi-fi wireframes. Automated tests, validating the appearance, are called [snapshot tests](https://jestjs.io/docs/snapshot-testing).

