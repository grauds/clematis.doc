"use strict";(self.webpackChunkclematis_doc=self.webpackChunkclematis_doc||[]).push([[1882],{32948:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>l,contentTitle:()=>r,default:()=>p,frontMatter:()=>i,metadata:()=>o,toc:()=>c});const o=JSON.parse('{"id":"web-applications/components","title":"Composable Components","description":"The goal is to keep the components reusable and keep the number of dependencies to other components at minimum:","source":"@site/docs/web-applications/components.md","sourceDirName":"web-applications","slug":"/web-applications/components","permalink":"/clematis.doc/docs/web-applications/components","draft":false,"unlisted":false,"tags":[{"inline":true,"label":"angular_components","permalink":"/clematis.doc/docs/tags/angular-components"},{"inline":true,"label":"function_components","permalink":"/clematis.doc/docs/tags/function-components"},{"inline":true,"label":"react_context","permalink":"/clematis.doc/docs/tags/react-context"},{"inline":true,"label":"hot_reloading","permalink":"/clematis.doc/docs/tags/hot-reloading"}],"version":"current","sidebarPosition":7,"frontMatter":{"sidebar_position":7,"tags":["angular_components","function_components","react_context","hot_reloading"]},"sidebar":"tutorialSidebar","previous":{"title":"Styling","permalink":"/clematis.doc/docs/web-applications/styling"},"next":{"title":"State Management","permalink":"/clematis.doc/docs/web-applications/state-management"}}');var a=t(74848),s=t(28453);const i={sidebar_position:7,tags:["angular_components","function_components","react_context","hot_reloading"]},r="Composable Components",l={},c=[{value:"Money Tracker",id:"money-tracker",level:2},{value:"Example",id:"example",level:3},{value:"Layout",id:"layout",level:3},{value:"Usage",id:"usage",level:3},{value:"Pomodoro",id:"pomodoro",level:2},{value:"Example",id:"example-1",level:3},{value:"Layout",id:"layout-1",level:3},{value:"Usage",id:"usage-1",level:3},{value:"Cosmic",id:"cosmic",level:2},{value:"Example",id:"example-2",level:3},{value:"Properties",id:"properties",level:3}];function d(e){const n={a:"a",admonition:"admonition",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",...(0,s.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n.header,{children:(0,a.jsx)(n.h1,{id:"composable-components",children:"Composable Components"})}),"\n",(0,a.jsx)(n.p,{children:"The goal is to keep the components reusable and keep the number of dependencies to other components at minimum:"}),"\n",(0,a.jsxs)(n.ol,{children:["\n",(0,a.jsxs)(n.li,{children:["Common components are in the ",(0,a.jsx)(n.code,{children:"components"})," directory, module or library, depending on the project. They encapsulate styles,\ntests, and the code itself in the single directory."]}),"\n",(0,a.jsx)(n.li,{children:"If a component is too specific and can't be used anywhere else, it is placed to a nested directory within its parent."}),"\n"]}),"\n",(0,a.jsx)(n.h2,{id:"money-tracker",children:"Money Tracker"}),"\n",(0,a.jsxs)(n.p,{children:["Shared Angular components are in the ",(0,a.jsx)(n.code,{children:"shared-components"})," library:"]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-json",metastring:'title="libs/shared-components/package.json"',children:'{\n  "name": "@clematis-shared/shared-components",\n  "version": "0.0.1",\n  "peerDependencies": {\n    "@angular/common": "^18.1.0",\n    "@angular/core": "^18.1.0"\n  },\n  "sideEffects": false\n}\n'})}),"\n",(0,a.jsxs)(n.p,{children:["More information about components themselves and the ways they can be used in the ",(0,a.jsx)(n.a,{href:"https://github.com/grauds/money.tracker.ui/blob/5146a9d453b4838564b33c5416372581fcc8942c/libs/shared-components/README.md",children:"README"}),"."]}),"\n",(0,a.jsx)(n.h3,{id:"example",children:"Example"}),"\n",(0,a.jsxs)(n.p,{children:["A typical component looks like the following class annotated with ",(0,a.jsx)(n.code,{children:"@Component"})," annotation.\nNote that the annotation has all required resources' names defined:"]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-Typescript",children:"import { Component, Input, OnInit } from '@angular/core';\nimport { Entity } from '@clematis-shared/model';\nimport { Router } from '@angular/router';\n\n@Component({\n  selector: 'app-entity-element',\n  templateUrl: './entity-element.component.html',\n  styleUrls: ['./entity-element.component.sass']\n})\nexport class EntityElementComponent<T extends Entity> implements OnInit {\n\n  @Input() entity?: T;\n\n  entityLink: string | undefined;\n\n  constructor(private router: Router) { }\n\n  ngOnInit(): void {\n    this.entityLink = Entity.getRelativeSelfLinkHref(this.entity)\n  }\n\n  navigate = () => {\n    this.router.navigate([this.entityLink])\n  }\n\n}\n"})}),"\n",(0,a.jsxs)(n.p,{children:["Mind the ",(0,a.jsx)(n.code,{children:"@Input"})," annotation which exposes the annotated field to the outer customers and tests.\nIt is also okay to have a service injected in the constructor arguments. In this case it is the\ninstance of ",(0,a.jsx)(n.code,{children:"Router"}),", the component's function ",(0,a.jsx)(n.code,{children:"navigate"})," uses this injected service to open the\nentity page in the browser."]}),"\n",(0,a.jsx)(n.h3,{id:"layout",children:"Layout"}),"\n",(0,a.jsxs)(n.p,{children:["The template referred by name in the ",(0,a.jsx)(n.code,{children:"@Component"})," annotation contains the actual HTML code of the component:"]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-html",children:'<div class="row" style="border-bottom: 1px darkgray solid; padding: 5px; ">\n  <div class="col-sm-12">\n    <div style="padding-top: 5px; padding-bottom: 5px;">\n      <div><a routerLink="{{entityLink}}">{{entity ? entity.name : entityLink}}</a></div>\n    </div>\n  </div>\n</div>\n\n'})}),"\n",(0,a.jsxs)(n.p,{children:["Names refer fields of the enclosing class: ",(0,a.jsx)(n.code,{children:"{{field_name}}"}),"."]}),"\n",(0,a.jsx)(n.h3,{id:"usage",children:"Usage"}),"\n",(0,a.jsx)(n.p,{children:"The component can be used to display a table of elements, for instance:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-angular2html",children:'<div *ngFor="let a of entities">\n    <app-entity-element [entity]="a"></app-entity-element>\n</div>\n'})}),"\n",(0,a.jsxs)(n.p,{children:["More info in ",(0,a.jsx)(n.a,{href:"https://angular.dev/guide/components",children:"Angular docs for components"})]}),"\n",(0,a.jsx)(n.h2,{id:"pomodoro",children:"Pomodoro"}),"\n",(0,a.jsx)(n.p,{children:"Components in this React-17-based project are following the same principles,\njust with a little bit of different semantics."}),"\n",(0,a.jsx)(n.h3,{id:"example-1",children:"Example"}),"\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.a,{href:"https://react.dev/learn/your-first-component#defining-a-component",children:"Function components"})," are used, for example:"]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-typescript",metastring:'jsx title="src/shared/Header/Header.tsx"',children:"import * as React from 'react';\nimport { hot } from 'react-hot-loader/root'\n\nimport { Title } from './Title';\nimport { Stats } from './Stats';\n\nimport styles from './header.less'\n\nexport interface IHeaderComponentProps {\n    version: string\n}\n\nfunction HeaderComponent({\n    version\n}: Readonly<IHeaderComponentProps>): React.JSX.Element {\n    return (\n        <header className={styles.header}>\n            <Title /> \n            <Stats />\n            {version}\n        </header>\n    )\n}\n\nexport const Header = hot(HeaderComponent);\n"})}),"\n",(0,a.jsx)(n.admonition,{title:"Can be updated",type:"note",children:(0,a.jsxs)(n.p,{children:["Also, there could be a ",(0,a.jsx)(n.code,{children:"hot"})," wrapper from ",(0,a.jsx)(n.code,{children:"react-hot-reloader"})," is applied to the\ncomponent before it is exported, it is ",(0,a.jsx)(n.a,{href:"https://www.npmjs.com/package/react-hot-loader",children:(0,a.jsx)("i",{children:"hot-exported"})}),". However,\ntoday this middleware is being replaced by ",(0,a.jsx)(n.a,{href:"https://github.com/facebook/react/issues/16604",children:"React Fast Refresh"}),"."]})}),"\n",(0,a.jsx)(n.h3,{id:"layout-1",children:"Layout"}),"\n",(0,a.jsxs)(n.p,{children:["Two nested parts are used in the layout: ",(0,a.jsx)(n.code,{children:"Title"})," and ",(0,a.jsx)(n.code,{children:"Stats"}),", notably, JSX syntax\nis embedded into the component's code in TypeScript. Variables are referred by their names: ",(0,a.jsx)(n.code,{children:"{variable_name}"}),"."]}),"\n",(0,a.jsx)(n.h3,{id:"usage-1",children:"Usage"}),"\n",(0,a.jsx)(n.p,{children:"It is intended to use components in the similar JSX code of parent components, for example:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-jsx",children:" <ParentComponent>\n    <Header version={version} />\n </ParentComponent>\n"})}),"\n",(0,a.jsx)(n.h2,{id:"cosmic",children:"Cosmic"}),"\n",(0,a.jsx)(n.p,{children:"The project also uses function components of React 18; components are, of course, compatible\nwith Pomodoro."}),"\n",(0,a.jsx)(n.h3,{id:"example-2",children:"Example"}),"\n",(0,a.jsxs)(n.p,{children:["The following class is just using ",(0,a.jsx)(n.code,{children:"*.module.css"})," name convention:"]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-typescript",metastring:'jsx title="src/components/AlertDialog/AlertDialog.tsx"',children:'import React from "react";\nimport {Dialog} from "@/components/Dialog";\n\nimport styles from "./alertdialog.module.css";\n\nexport interface IAlertDialogProps {\n    title: string;\n    buttonTitle?: string;\n    onClose: () => void;\n    isOpen: boolean;\n    message: string;\n}\n\nexport function AlertDialog({\n    title,\n    buttonTitle,\n    onClose,\n    isOpen,\n    message\n}: Readonly<IAlertDialogProps>): React.JSX.Element {\n    return <Dialog title={title} isOpen={isOpen} onClose={onClose}>\n        <div className="max-w-md w-full justify-items-center">\n            {message}\n        </div>\n        <div className="max-w-md w-full justify-items-center">\n            <button className={styles.cancel} onClick={() => onClose()}>\n                {buttonTitle ?? \'\u0417\u0430\u043a\u0440\u044b\u0442\u044c\'}\n            </button>\n        </div>\n    </Dialog>\n}\n'})}),"\n",(0,a.jsx)(n.admonition,{type:"note",children:(0,a.jsx)(n.p,{children:"Hot reload is done by Vite React plugin"})}),"\n",(0,a.jsx)(n.h3,{id:"properties",children:"Properties"}),"\n",(0,a.jsxs)(n.p,{children:["React-based projects are following the fine line between 'property drilling' antipattern and context overuse,\nthe latter is described in ",(0,a.jsx)(n.a,{href:"https://react.dev/learn/passing-data-deeply-with-context#before-you-use-context",children:"React documentation"})," for contexts."]}),"\n",(0,a.jsx)(n.p,{children:"In other words, in cases like below, it is okay to leave everything as it is now for clarity:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-typescript",metastring:'jsx title="src/components/InputDataTable/InputDataTable.tsx"',children:"export interface IInputDataComponentProps  {\n    loading: boolean\n    selectedData?: InputData\n    data: InputData[]\n    onClick: (d: InputData) => void\n    onClone: (d: InputData) => void\n    onCopy: (d: InputData) => void\n    onMove: (d: InputData) => void\n    onEdit: (d: InputData) => void\n    onDelete: (d: InputData) => void\n    onBalloonClick: (d: InputData, balloon: Balloon, reference?: Balloon) => void\n    isCalculating: boolean\n    onCalculate: (inputData: InputData) => void;\n}\n\nexport function InputDataTable(props: Readonly<IInputDataComponentProps>): React.JSX.Element {\n\n    return <table className=\"table-fixed min-w-[800px] w-full border-collapse border border-slate-300\">\n         <tbody>\n        { props.data ?\n            props.data.map(d => {\n                return <InputDataRow\n                    key={d._links.self.href}\n                    selected={props.selectedData?._links.self.href === d._links.self.href}\n                    inputData={d}\n                    onClick={props.onClick}\n                    onClone={props.onClone}\n                    onCopy={props.onCopy}\n                    onMove={props.onMove}\n                    onEdit={props.onEdit}\n                    onDelete={props.onDelete}\n                    onBalloonClick={props.onBalloonClick}\n                    isCalculating={props.isCalculating}\n                    onCalculate={props.onCalculate}\n                />\n            }) : ''\n        }\n        </tbody>\n    </table>\n}\n"})}),"\n",(0,a.jsx)(n.p,{children:"Context should be used for user related information, theming and something as global;\nbut there could be another option to implement the same with the help of state managers."})]})}function p(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,a.jsx)(n,{...e,children:(0,a.jsx)(d,{...e})}):d(e)}},28453:(e,n,t)=>{t.d(n,{R:()=>i,x:()=>r});var o=t(96540);const a={},s=o.createContext(a);function i(e){const n=o.useContext(s);return o.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:i(e.components),o.createElement(s.Provider,{value:n},e.children)}}}]);