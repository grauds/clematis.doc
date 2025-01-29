---
sidebar_position: 2
---

# Pomodoro / Reddit Poc

Pomodoro Timer doesn't do any server requests, but if it would've needed to make one, it would've used
[axios](https://axios-http.com/) library to fetch data as the Reddit Poc application does.

## Axios Library

The library is installed via command line:

````bash
npm install axios
````

Since axios is a [promise-based](https://javascript.info/promise-basics) HTTP Client,
a developer should handle both successful and erroneous responses himself with
`then` and `catch` methods chaining after the request.

:::info[Note]
Axios makes [XMLHttpRequests](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) from the browser
:::

## Request And Response Actions

In the example above the response has type:

````typescript
export interface IUserData {
  name?: string;
  iconImg?: string;
}
````
This type is used to collect data from the successful response and also to deliver
the data to Redux reducer. In order to do that, Redux actions are needed:

````typescript
export const ME_REQUEST = "ME_REQUEST";

export type MeRequestAction = {
    type: typeof ME_REQUEST;
};
export const meRequest: ActionCreator<MeRequestAction> = () => ({
    type: ME_REQUEST,
});

export const ME_REQUEST_SUCCESS = "ME_REQUEST_SUCCESS";

export type MeRequestSuccessAction = {
    type: typeof ME_REQUEST_SUCCESS;
    data: IUserData;
};
export const meRequestSuccess: ActionCreator<MeRequestSuccessAction> = (
    data: IUserData
) => ({
    type: ME_REQUEST_SUCCESS,
    data,
});

export const ME_REQUEST_ERROR = "ME_REQUEST_ERROR";

export type MeRequestErrorAction = {
    type: typeof ME_REQUEST_ERROR;
    error: string;
};
export const meRequestError: ActionCreator<MeRequestErrorAction> = (
    error: string
) => ({
    type: ME_REQUEST_ERROR,
    error,
});
````
## The Service Layer

The next step is to use it in Redux store, for instance to authenticate
a user via Reddit API:

````typescript title="src/store/actions.ts"
import axios from "axios";

export const meRequestAsync =
    (): ThunkAction<void, RootState, unknown, Action<string>> =>
        (dispatch, getState) => {
            dispatch(meRequest());
            axios
                .get("https://oauth.reddit.com/api/v1/me", {
                    headers: { Authorization: `Bearer ${getState().token}` },
                })
                .then((resp) => {
                    const userData = resp.data;
                    dispatch(
                        meRequestSuccess({
                            name: userData.name,
                            iconImg: userData.icon_img,
                        })
                    );
                })
                .catch((error) => {
                    console.log(error);
                    dispatch(meRequestError(error));
                });

        };
````
This method uses `dispatch` function three times: to start the request, to get the results or
to process an error.

## Data Sync With Redux Store

Using `dispatch` method the example above talks to Redux store and updates data there
once the request is initiated and completed. It is there the request and response
actions are used:

````typescript
export type MeState = {
    loading: boolean;
    error: string;
    data: IUserData
};

type MeActions =
    | MeRequestAction
    | MeRequestSuccessAction
    | MeRequestErrorAction;

export const meReducer: Reducer<MeState, MeActions> = (state, action) => {
    switch (action.type) {
        case ME_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case ME_REQUEST_ERROR:
            return {
                ...state,
                loading: false,
                error: action.error,
            };
        case ME_REQUEST_SUCCESS:
            return {
                ...state,
                loading: false,
                data: action.data,
            };
        default:
            return state;
    }
};
````
A smaller `meReducer` becomes a part of a root reducer:

````typescript
export const rootReducer: Reducer<RootState> = (
    state = initialState,
    action
) => {
    switch (action.type) {
        //..   
        case ME_REQUEST:
        case ME_REQUEST_SUCCESS:
        case ME_REQUEST_ERROR:
            return {
                ...state,
                me: meReducer(state.me, action),
            };
        //..    
    }
}
````
Where the root state is something like:

````typescript
export type RootState = {
    //..
    user: MeState;
    //..
};
````

## A Custom React Hook

It is now time to use `meRequestAsync` function in a custom hook. This hook would be then
used by React function components the way the standard hooks are used:

````typescript
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/reducer";
import { IUserData, meRequestAsync } from "../../store/me/actions";

export function useUserData() {
    const data = useSelector<RootState, IUserData>(state => state.me.data)
    const token = useSelector<RootState, string>(state => state.token)
    const loading = useSelector<RootState, boolean>((state) => state.me.loading);
    const dispatch = useDispatch<any>();

    useEffect( ()=> {
      if (token !== "undefined" && token) {
          dispatch(meRequestAsync())
      }
    }, [token])
  
    return {
      data,
      loading
    }
}
````

## Example Usage In A Context Provider

This custom hook is using `dispatch(meRequestAsync())` in `useEffect` hook, and in turn,
any component can use it, for instance a user context provider which will make the user
information visible to all nested components
(as per [React context](https://react.dev/learn/passing-data-deeply-with-context) definition):

````typescript jsx
import React from 'react';
import { useUserData } from '../../utils/react/useUserData';
import { useDispatch } from 'react-redux';
import { saveToken } from '../../store/me/actions';

export interface IUserContextData {
    name?: string;
    iconImg?: string;
}

export const userContext = React.createContext<IUserContextData>({})

export function UserContextProvider({ children }: Readonly<{ children: React.ReactNode }>) {

    const dispatch = useDispatch<any>();

    React.useEffect(() => {
        dispatch(saveToken())
    }, []);

    const { data } = useUserData();

    return (
        <userContext.Provider value={data as IUserContextData}>
            { children }
        </userContext.Provider>
    )
}
````

## Example Usage in A Component

Another example could be a simple component, displaying information from a user account:

````typescript jsx
export function SearchBlock() {
    const { data, loading } = useUserData();

    return (
        <div className={styles.searchBlock}>
            <UserBlock avatarSrc={data ? data.iconImg : undefined}
                       username={data ? data.name : undefined}
                       loading={loading}
            />
        </div>
    );
}
````