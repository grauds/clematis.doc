---
sidebar_position: 7
tags:
  - angular_components
  - function_components
  - react_context
  - hot_reloading
---

# Composable Components

The goal is to keep the components reusable and keep the number of dependencies to other components at minimum:

1. Common components are in the `components` directory, module or library, depending on the project. They encapsulate styles, tests and the code itself in the single directory. 
2. If a component is too specific and can't be used anywhere else, it is placed to a nested directory within its parent's.

## Money Tracker

Shared Angular components are in the `shared-components` library:

```json title="libs/shared-components/package.json"
{
  "name": "@clematis-shared/shared-components",
  "version": "0.0.1",
  "peerDependencies": {
    "@angular/common": "^18.1.0",
    "@angular/core": "^18.1.0"
  },
  "sideEffects": false
}
```

More information about components themselves and the ways they can be used in the [README](https://github.com/grauds/money.tracker.ui/blob/5146a9d453b4838564b33c5416372581fcc8942c/libs/shared-components/README.md).

### Example

A typical component looks like the following class annotated with `@Component` annotation. Note that the annotation has all required resources' names defined:

```Typescript
import { Component, Input, OnInit } from '@angular/core';
import { Entity } from '@clematis-shared/model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-entity-element',
  templateUrl: './entity-element.component.html',
  styleUrls: ['./entity-element.component.sass']
})
export class EntityElementComponent<T extends Entity> implements OnInit {

  @Input() entity?: T;

  entityLink: string | undefined;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.entityLink = Entity.getRelativeSelfLinkHref(this.entity)
  }

  navigate = () => {
    this.router.navigate([this.entityLink])
  }

}
```

Mind the `@Input` annotation which exposes the annotated field to the outer customers and tests. It is also okay to have a service injected in the constructor arguments. In this case it is the instance of `Router`, the component's function `navigate` uses this injected service to open the entity page in the browser.

### Layout

The template referred by name in the `@Component` annotation contains the actual HTML code of the component:

```html
<div class="row" style="border-bottom: 1px darkgray solid; padding: 5px; ">
  <div class="col-sm-12">
    <div style="padding-top: 5px; padding-bottom: 5px;">
      <div><a routerLink="{{entityLink}}">{{entity ? entity.name : entityLink}}</a></div>
    </div>
  </div>
</div>

```
Fields of the enclosing class are referred by names: `{{field_name}}`.


### Usage

The component can be used to display a table of elements, for instance:

```angular2html
<div *ngFor="let a of entities">
    <app-entity-element [entity]="a"></app-entity-element>
</div>
```

More info in [Angular docs for components](https://angular.dev/guide/components)

## Pomodoro

Components in this React-17-based project are following the same principles, just with a little bit different semantics.

### Example

[Function components](https://react.dev/learn/your-first-component#defining-a-component) are used, for example:

```typescript jsx title="src/shared/Header/Header.tsx"
import * as React from 'react';
import { hot } from 'react-hot-loader/root'

import { Title } from './Title';
import { Stats } from './Stats';

import styles from './header.less'

export interface IHeaderComponentProps {
    version: string
}

function HeaderComponent({
    version
}: Readonly<IHeaderComponentProps>): React.JSX.Element {
    return (
        <header className={styles.header}>
            <Title /> 
            <Stats />
            {version}
        </header>
    )
}

export const Header = hot(HeaderComponent);
```

:::note[Can be updated]
Also, there could be a `hot` wrapper from `react-hot-reloader` is applied to the component before it is exported, it is [<i>hot-exported</i>](https://www.npmjs.com/package/react-hot-loader). However, today this middleware is being replaced by [React Fast Refresh](https://github.com/facebook/react/issues/16604).
:::


### Layout

Two nested components are used in the layout: `Title` and `Stats`, notably, JSX syntax is embedded into the component's code in Typescript. Variables are referred by names: `{variable_name}`.


### Usage

It is intended to use components in the similar JSX code of parent components, for example:

```jsx
 <ParentComponent>
    <Header version={version} />
 </ParentComponent>
```

## Cosmic

The project also uses function components of React 18, components are of course compatible
with Pomodoro.

### Example

The following class is just using `*.module.css` name convention:

```typescript jsx title="src/components/AlertDialog/AlertDialog.tsx"
import React from "react";
import {Dialog} from "@/components/Dialog";

import styles from "./alertdialog.module.css";

export interface IAlertDialogProps {
    title: string;
    buttonTitle?: string;
    onClose: () => void;
    isOpen: boolean;
    message: string;
}

export function AlertDialog({
    title,
    buttonTitle,
    onClose,
    isOpen,
    message
}: Readonly<IAlertDialogProps>): React.JSX.Element {
    return <Dialog title={title} isOpen={isOpen} onClose={onClose}>
        <div className="max-w-md w-full justify-items-center">
            {message}
        </div>
        <div className="max-w-md w-full justify-items-center">
            <button className={styles.cancel} onClick={() => onClose()}>
                {buttonTitle ?? 'Закрыть'}
            </button>
        </div>
    </Dialog>
}
```

:::note
Hot reload is done by Vite React plugin
:::

### Properties

React based projects are following the fine line between 'property drilling' antipattern and context overuse, the latter
is described in [React documentation](https://react.dev/learn/passing-data-deeply-with-context#before-you-use-context)
for contexts.

In other words, in cases like below it is okay to leave everything as it is now for clarity:

```typescript jsx title="src/components/InputDataTable/InputDataTable.tsx"
export interface IInputDataComponentProps  {
    loading: boolean
    selectedData?: InputData
    data: InputData[]
    onClick: (d: InputData) => void
    onClone: (d: InputData) => void
    onCopy: (d: InputData) => void
    onMove: (d: InputData) => void
    onEdit: (d: InputData) => void
    onDelete: (d: InputData) => void
    onBalloonClick: (d: InputData, balloon: Balloon, reference?: Balloon) => void
    isCalculating: boolean
    onCalculate: (inputData: InputData) => void;
}

export function InputDataTable(props: Readonly<IInputDataComponentProps>): React.JSX.Element {

    return <table className="table-fixed min-w-[800px] w-full border-collapse border border-slate-300">
         <tbody>
        { props.data ?
            props.data.map(d => {
                return <InputDataRow
                    key={d._links.self.href}
                    selected={props.selectedData?._links.self.href === d._links.self.href}
                    inputData={d}
                    onClick={props.onClick}
                    onClone={props.onClone}
                    onCopy={props.onCopy}
                    onMove={props.onMove}
                    onEdit={props.onEdit}
                    onDelete={props.onDelete}
                    onBalloonClick={props.onBalloonClick}
                    isCalculating={props.isCalculating}
                    onCalculate={props.onCalculate}
                />
            }) : ''
        }
        </tbody>
    </table>
}
```
Context should be used for user related information, theming and something as global, however, there could be another option 
to implement the same with the help of state managers.
