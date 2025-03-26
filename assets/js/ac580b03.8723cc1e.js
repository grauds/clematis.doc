"use strict";(self.webpackChunkclematis_doc=self.webpackChunkclematis_doc||[]).push([[6553],{25755:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>i,default:()=>p,frontMatter:()=>r,metadata:()=>s,toc:()=>d});const s=JSON.parse('{"id":"web-applications/data-querying/pomodoro","title":"Pomodoro / Reddit Thunks","description":"Pomodoro Timer doesn\'t do any server requests, but if it had needed to make one, it would\'ve used","source":"@site/docs/web-applications/data-querying/pomodoro.md","sourceDirName":"web-applications/data-querying","slug":"/web-applications/data-querying/pomodoro","permalink":"/docs/web-applications/data-querying/pomodoro","draft":false,"unlisted":false,"tags":[{"inline":true,"label":"axios","permalink":"/docs/tags/axios"},{"inline":true,"label":"xml_http_request","permalink":"/docs/tags/xml-http-request"},{"inline":true,"label":"custom_react_hook","permalink":"/docs/tags/custom-react-hook"}],"version":"current","sidebarPosition":2,"frontMatter":{"sidebar_position":2,"tags":["axios","xml_http_request","custom_react_hook"]},"sidebar":"tutorialSidebar","previous":{"title":"Money Tracker Data Exchange","permalink":"/docs/web-applications/data-querying/money-tracker"},"next":{"title":"Cosmic And RTK","permalink":"/docs/web-applications/data-querying/cosmic"}}');var o=n(74848),a=n(28453);const r={sidebar_position:2,tags:["axios","xml_http_request","custom_react_hook"]},i="Pomodoro / Reddit Thunks",c={},d=[{value:"Axios Library",id:"axios-library",level:2},{value:"Request And Response Actions",id:"request-and-response-actions",level:2},{value:"The Service Layer",id:"the-service-layer",level:2},{value:"Data Sync With Redux Store",id:"data-sync-with-redux-store",level:2},{value:"A Custom React Hook",id:"a-custom-react-hook",level:2},{value:"Example Usage In A Context Provider",id:"example-usage-in-a-context-provider",level:2},{value:"Example Usage in A Component",id:"example-usage-in-a-component",level:2}];function l(e){const t={a:"a",admonition:"admonition",code:"code",h1:"h1",h2:"h2",header:"header",p:"p",pre:"pre",...(0,a.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(t.header,{children:(0,o.jsx)(t.h1,{id:"pomodoro--reddit-thunks",children:"Pomodoro / Reddit Thunks"})}),"\n",(0,o.jsxs)(t.p,{children:["Pomodoro Timer doesn't do any server requests, but if it had needed to make one, it would've used\n",(0,o.jsx)(t.a,{href:"https://axios-http.com/",children:"axios"})," library to fetch data as the Reddit Poc application does."]}),"\n",(0,o.jsx)(t.h2,{id:"axios-library",children:"Axios Library"}),"\n",(0,o.jsx)(t.p,{children:"The library is installed via command line:"}),"\n",(0,o.jsx)(t.pre,{children:(0,o.jsx)(t.code,{className:"language-bash",children:"npm install axios\n"})}),"\n",(0,o.jsxs)(t.p,{children:["Since axios is a ",(0,o.jsx)(t.a,{href:"https://javascript.info/promise-basics",children:"promise-based"})," HTTP Client,\na developer should handle both successful and erroneous responses himself with\n",(0,o.jsx)(t.code,{children:"then"})," and ",(0,o.jsx)(t.code,{children:"catch"})," methods chaining after the request."]}),"\n",(0,o.jsx)(t.admonition,{title:"Note",type:"info",children:(0,o.jsxs)(t.p,{children:["Axios makes ",(0,o.jsx)(t.a,{href:"https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest",children:"XMLHttpRequests"})," from the browser"]})}),"\n",(0,o.jsx)(t.h2,{id:"request-and-response-actions",children:"Request And Response Actions"}),"\n",(0,o.jsx)(t.p,{children:"In the example above, the response has type:"}),"\n",(0,o.jsx)(t.pre,{children:(0,o.jsx)(t.code,{className:"language-typescript",children:"export interface IUserData {\n  name?: string;\n  iconImg?: string;\n}\n"})}),"\n",(0,o.jsx)(t.p,{children:"This type is used to collect data from the successful response and also to deliver\nthe data to Redux reducer. To do that, Redux actions are needed:"}),"\n",(0,o.jsx)(t.pre,{children:(0,o.jsx)(t.code,{className:"language-typescript",children:'export const ME_REQUEST = "ME_REQUEST";\n\nexport type MeRequestAction = {\n    type: typeof ME_REQUEST;\n};\nexport const meRequest: ActionCreator<MeRequestAction> = () => ({\n    type: ME_REQUEST,\n});\n\nexport const ME_REQUEST_SUCCESS = "ME_REQUEST_SUCCESS";\n\nexport type MeRequestSuccessAction = {\n    type: typeof ME_REQUEST_SUCCESS;\n    data: IUserData;\n};\nexport const meRequestSuccess: ActionCreator<MeRequestSuccessAction> = (\n    data: IUserData\n) => ({\n    type: ME_REQUEST_SUCCESS,\n    data,\n});\n\nexport const ME_REQUEST_ERROR = "ME_REQUEST_ERROR";\n\nexport type MeRequestErrorAction = {\n    type: typeof ME_REQUEST_ERROR;\n    error: string;\n};\nexport const meRequestError: ActionCreator<MeRequestErrorAction> = (\n    error: string\n) => ({\n    type: ME_REQUEST_ERROR,\n    error,\n});\n'})}),"\n",(0,o.jsx)(t.h2,{id:"the-service-layer",children:"The Service Layer"}),"\n",(0,o.jsx)(t.p,{children:"The next step is to use it in Redux store, for instance, to authenticate\na user via Reddit API:"}),"\n",(0,o.jsx)(t.pre,{children:(0,o.jsx)(t.code,{className:"language-typescript",metastring:'title="src/store/actions.ts"',children:'import axios from "axios";\n\nexport const meRequestAsync =\n    (): ThunkAction<void, RootState, unknown, Action<string>> =>\n        (dispatch, getState) => {\n            dispatch(meRequest());\n            axios\n                .get("https://oauth.reddit.com/api/v1/me", {\n                    headers: { Authorization: `Bearer ${getState().token}` },\n                })\n                .then((resp) => {\n                    const userData = resp.data;\n                    dispatch(\n                        meRequestSuccess({\n                            name: userData.name,\n                            iconImg: userData.icon_img,\n                        })\n                    );\n                })\n                .catch((error) => {\n                    console.log(error);\n                    dispatch(meRequestError(error));\n                });\n\n        };\n'})}),"\n",(0,o.jsxs)(t.p,{children:["This method uses ",(0,o.jsx)(t.code,{children:"dispatch"})," function three times: to start the request, to get the results or\nto process an error."]}),"\n",(0,o.jsx)(t.h2,{id:"data-sync-with-redux-store",children:"Data Sync With Redux Store"}),"\n",(0,o.jsxs)(t.p,{children:["Using ",(0,o.jsx)(t.code,{children:"dispatch"})," method the example above talks to Redux store and updates data there\nonce the request is initiated and completed. It is there the request and response\nactions are used:"]}),"\n",(0,o.jsx)(t.pre,{children:(0,o.jsx)(t.code,{className:"language-typescript",children:"export type MeState = {\n    loading: boolean;\n    error: string;\n    data: IUserData\n};\n\ntype MeActions =\n    | MeRequestAction\n    | MeRequestSuccessAction\n    | MeRequestErrorAction;\n\nexport const meReducer: Reducer<MeState, MeActions> = (state, action) => {\n    switch (action.type) {\n        case ME_REQUEST:\n            return {\n                ...state,\n                loading: true,\n            };\n        case ME_REQUEST_ERROR:\n            return {\n                ...state,\n                loading: false,\n                error: action.error,\n            };\n        case ME_REQUEST_SUCCESS:\n            return {\n                ...state,\n                loading: false,\n                data: action.data,\n            };\n        default:\n            return state;\n    }\n};\n"})}),"\n",(0,o.jsxs)(t.p,{children:["A smaller ",(0,o.jsx)(t.code,{children:"meReducer"})," becomes a part of a root reducer:"]}),"\n",(0,o.jsx)(t.pre,{children:(0,o.jsx)(t.code,{className:"language-typescript",children:"export const rootReducer: Reducer<RootState> = (\n    state = initialState,\n    action\n) => {\n    switch (action.type) {\n        //..   \n        case ME_REQUEST:\n        case ME_REQUEST_SUCCESS:\n        case ME_REQUEST_ERROR:\n            return {\n                ...state,\n                me: meReducer(state.me, action),\n            };\n        //..    \n    }\n}\n"})}),"\n",(0,o.jsxs)(t.p,{children:["Where the root state contains ",(0,o.jsx)(t.code,{children:"MeState"}),":"]}),"\n",(0,o.jsx)(t.pre,{children:(0,o.jsx)(t.code,{className:"language-typescript",children:"export type RootState = {\n    //..\n    user: MeState;\n    //..\n};\n"})}),"\n",(0,o.jsx)(t.h2,{id:"a-custom-react-hook",children:"A Custom React Hook"}),"\n",(0,o.jsxs)(t.p,{children:["It is now time to use ",(0,o.jsx)(t.code,{children:"meRequestAsync"})," function in a custom hook. This hook would be then\nused by React function components the way the standard hooks are used:"]}),"\n",(0,o.jsx)(t.pre,{children:(0,o.jsx)(t.code,{className:"language-typescript",children:'import { useEffect } from "react";\nimport { useDispatch, useSelector } from "react-redux";\nimport { RootState } from "../../store/reducer";\nimport { IUserData, meRequestAsync } from "../../store/me/actions";\n\nexport function useUserData() {\n    const data = useSelector<RootState, IUserData>(state => state.me.data)\n    const token = useSelector<RootState, string>(state => state.token)\n    const loading = useSelector<RootState, boolean>((state) => state.me.loading);\n    const dispatch = useDispatch<any>();\n\n    useEffect( ()=> {\n      if (token !== "undefined" && token) {\n          dispatch(meRequestAsync())\n      }\n    }, [token])\n  \n    return {\n      data,\n      loading\n    }\n}\n'})}),"\n",(0,o.jsx)(t.h2,{id:"example-usage-in-a-context-provider",children:"Example Usage In A Context Provider"}),"\n",(0,o.jsxs)(t.p,{children:["This custom hook is using ",(0,o.jsx)(t.code,{children:"dispatch(meRequestAsync())"})," in ",(0,o.jsx)(t.code,{children:"useEffect"})," hook, and in turn,\nany component can use it, for instance a user context provider which will make the user\ninformation visible to all nested components\n(as per ",(0,o.jsx)(t.a,{href:"https://react.dev/learn/passing-data-deeply-with-context",children:"React context"})," definition):"]}),"\n",(0,o.jsx)(t.pre,{children:(0,o.jsx)(t.code,{className:"language-typescript",metastring:"jsx",children:"import React from 'react';\nimport { useUserData } from '../../utils/react/useUserData';\nimport { useDispatch } from 'react-redux';\nimport { saveToken } from '../../store/me/actions';\n\nexport interface IUserContextData {\n    name?: string;\n    iconImg?: string;\n}\n\nexport const userContext = React.createContext<IUserContextData>({})\n\nexport function UserContextProvider({ children }: Readonly<{ children: React.ReactNode }>) {\n\n    const dispatch = useDispatch<any>();\n\n    React.useEffect(() => {\n        dispatch(saveToken())\n    }, []);\n\n    const { data } = useUserData();\n\n    return (\n        <userContext.Provider value={data as IUserContextData}>\n            { children }\n        </userContext.Provider>\n    )\n}\n"})}),"\n",(0,o.jsx)(t.h2,{id:"example-usage-in-a-component",children:"Example Usage in A Component"}),"\n",(0,o.jsx)(t.p,{children:"Another example could be a simple component, displaying information from a user account:"}),"\n",(0,o.jsx)(t.pre,{children:(0,o.jsx)(t.code,{className:"language-typescript",metastring:"jsx",children:"export function SearchBlock() {\n    const { data, loading } = useUserData();\n\n    return (\n        <div className={styles.searchBlock}>\n            <UserBlock avatarSrc={data ? data.iconImg : undefined}\n                       username={data ? data.name : undefined}\n                       loading={loading}\n            />\n        </div>\n    );\n}\n"})})]})}function p(e={}){const{wrapper:t}={...(0,a.R)(),...e.components};return t?(0,o.jsx)(t,{...e,children:(0,o.jsx)(l,{...e})}):l(e)}},28453:(e,t,n)=>{n.d(t,{R:()=>r,x:()=>i});var s=n(96540);const o={},a=s.createContext(o);function r(e){const t=s.useContext(a);return s.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function i(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:r(e.components),s.createElement(a.Provider,{value:t},e.children)}}}]);