---
sidebar_position: 6
---

# Data Querying

## Money Tracker 

### Dependency Injection (DI)

It is worth mentioning Angular Dependency Injection (DI) before proceeding with
data exchange with server side. The services which talk to servers are injected into components
in constructor arguments, for example:

````typescript jsx title="libs/shared-components/src/lib/components/entity-list/entity-list.component.ts"
@Component({
    selector: 'app-entity-list',
    templateUrl: './entity-list.component.html',
    styleUrls: ['./entity-list.component.sass']
})
export class EntityListComponent<T extends Entity> implements OnInit {
    
    public constructor(@Inject("searchService") private readonly searchService: SearchService<T>,
        protected router: Router,
        protected route: ActivatedRoute) {
        
    }
    
}

````
The keyword `private` here automatically creates a private field and assigns the value,
no need to create the field for the autowired value manually. Otherwise, if the field has to have a different 
visibility scope, the `private` keyword has to be omitted.

:::info[More info on DI]
Check documentation at [Angular Dev](https://angular.dev/guide/di) for dependency injection 
details.
:::

### HTTP Client

The module is imported on application layer and libraries which need HTTP Client automatically
find it imported if they are used with the application:

````typescript title="apps/money-tracker-ui/src/app/app.module.ts"
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    declarations: [
        //..   
    ],
    imports: [
        HttpClientModule
    ]
})
````
:::tip[Can be improved]
The newer versions of Angular offer a different way to 
[configure HTTP Client](https://angular.dev/guide/http/setup#httpclientmodule-based-configuration).
:::

:::info[Can use better low level API]
By default, HttpClient uses the [XMLHttpRequests](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) 
to make requests. The withFetch feature switches the client to use the [fetch API](https://www.w3schools.com/js/js_api_fetch.asp)
instead.
:::

### Typed Response Values

Fetching data from the backend requires classes to get JSON parsed in a typed manner, and there are
two kind of such classes in the project's `model` library.

1. Data Transfer Objects for generic responses like in report endpoints and others, 
not obeying [REST Hateoas](https://en.wikipedia.org/wiki/HATEOAS) contract in `libs/model/src/dto` directory.
2. Entity classes for working with REST Hateoas resources in `libs/model/src/model` directory.

### A Special Library For Hypermedia Resources

Working with Hypermedia resources is much easier with this special client library, which understands the responses and
can deduce the URLs of the endpoint: [ngx-hateoas-client](https://github.com/lagoshny/ngx-hateoas-client).
Each entity class has a special decorator [@HateoasResource](https://github.com/lagoshny/ngx-hateoas-client) which announces 
the corresponding endpoint:

````typescript title="libs/model/src/model/account-balance.ts"
import { HateoasResource } from '@lagoshny/ngx-hateoas-client';
import { Entity } from './entity';

@HateoasResource('accountsTotals')
export class AccountBalance extends Entity {

  balance = 0;

  code = '';

}
````
As per documentation, it is required to mark your resource 
classes with this decorator otherwise you will get an error when performing resource request.

For Money Tracker, `Entity` is a base class for all Hateoas resources and it is itself
has a base class `Resource` from `@lagoshny/ngx-hateoas-client/lib/model/resource/resource.d.ts`:

````typescript title="libs/model/src/model/entity.ts"
import { Resource } from '@lagoshny/ngx-hateoas-client';

export class Entity extends Resource {

  name: string | undefined;

 //..
}

````
The base class is responsible for dealing with other resources and collection of
resources relations during data exchange behind the scenes.

### The Service Layer 

It is enough to have a special decorator for a class to become a service, the main 
condition is that the future service has to be injectable:

````typescript title="apps/money-tracker-ui/src/app/about/about.component.ts"
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class StatsService {

  constructor(
    private readonly http: HttpClient,
  ) {
      //..
  }

  getIncomeTransactionsCount(): Observable<InfoAbout> {
      return this.http.get<InfoAbout>('/about');
  }
}

````

Also, it has to have `HttpClient` injected to make HTTP calls to backend. That's all.
Then such service in turn is injected into a stateful component:

````typescript title="apps/money-tracker-ui/src/app/about/about.component.ts"
@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.sass'],
})
export class AboutComponent implements OnInit {

    infoAbout: InfoAbout | undefined;
    
    constructor(private readonly statsService: StatsService) {
        //..
    }

    ngOnInit(): void {
        this.title.setTitle('Money Tracker - About');
        this.loadData();
    }
    
    loadData() {
        this.statsService.getIncomeTransactionsCount().subscribe(infoAbout => {
            this.infoAbout = infoAbout;
        });
    }
}
````
Then the data is loaded on component initialization, 
see [Angular Components Lifecycle](https://angular.dev/guide/components/lifecycle#).

### The Hypermedia Service

There is a special service `HateoasResourceService` for Hateoas resource which understands `Resource` decorators of
entity classes and provides a wide range of related functions for 
handling Hypermedia links. Application services described above have just inject and 
use it in a typesafe manner as the class is generic. For example:

````typescript title="libs/shared-components/src/lib/service/accounts.service.ts"
import { 
    HateoasResourceService,
    PagedResourceCollection,
    ResourceCollection
} from "@lagoshny/ngx-hateoas-client";

@Injectable()
export class AccountsService {

    constructor(private http: HttpClient,
                private hateoasService: HateoasResourceService) {
        //..
    }

    searchPage(options: PagedGetOption | undefined, queryName: string):
        Observable<PagedResourceCollection<AccountBalance>> {
        return this.hateoasService.searchPage<AccountBalance>(AccountBalance, queryName, options);
    }
}
````
The method `searchPage` is using some additional classes to parse pages resource
collections returned by the backend.

### RxJS Observables In Stateful Components 

The components which exchange data with servers contain [<i>RxJS observable</i>](https://rxjs.dev/guide/observable) fields allowing 
clients to update rendered user interface as the data changes. 

:::info[More info on RxJS]
This part of client data flow in Angular is tightly coupled
with [Reactive Extensions Library for JavaScript](https://rxjs.dev/).
:::

## Pomodoro / Reddit Poc

Pomodoro Timer doesn't do any server requests, but if it would've needed to make one, it would've used 
[axios](https://axios-http.com/) library to fetch data as the Reddit Poc application does.

### Axios Library

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

### Request And Response Actions

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
### The Service Layer

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

### Data Sync With Redux Store

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

### A Custom React Hook

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

### Example Usage In A Context Provider

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

### Example Usage in A Component

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

