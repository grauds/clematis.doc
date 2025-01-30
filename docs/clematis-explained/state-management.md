---
sidebar_position: 5
tags:
  - stateless
  - stateful
  - redux
  - persistence
  - dispatching
  - RTK
---

# State Management

## Money Tracker 

To separate Angular components using statefulness criteria one should use the folowing:

1. <i>Stateless</i> components only have `@Input` and `@Output` fields
for data exchange with the parent components
2. <i>Stateful</i> components
have other fields with data, which they get either from the parent components
or retrieve themselves using injected services.

:::info[More info on components in general]
[https://angular.dev/guide/components](https://angular.dev/guide/components)
:::

## Pomodoro

### Declaration

This project uses the previous version of [Redux](https://redux.js.org) state management:

```typescript title="src/App.tsx"
const store = createStore(
    rootReducer,
    persistedState,
    composeWithDevTools(applyMiddleware(thunk))
);
```
Where variable `rootReducer` is the root state of the application,
see `src/store/reducer.ts`

### Persistent State 

Variable `persistedState` is used to store the state data 
in the browser. The following piece of code is used to load the data:

```typescript  title="src/App.tsx"
let persistedState
if (typeof window !== "undefined") {
    const item = localStorage.getItem("reduxState")
    persistedState = item ? JSON.parse(item, datesReviver) : initialState;
}
```

...and the code below to save the data:
```typescript  title="src/App.tsx"
if (typeof window !== 'undefined') {
  store.subscribe(() => {
    localStorage.setItem("reduxState", JSON.stringify(store.getState()));
  });
}
```

### Store Provider

Pomodoro uses `Provider` class directly:

````typescript jsx title="src/App.tsx"
<Provider store={store}>
    {mounted && (
        <BrowserRouter>
            <Layout>
                <Header />
                <Content>
                    <Routes>
                        <Route path="/" element={<Main />} />
                        <Route path="/statistics" element={<Statistics />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Content>
            </Layout>
        </BrowserRouter>
    )}
</Provider>
````

### Using `useDispatch` hook

To update the Redux state it is required to have action creators ready and the reducers properly 
written in `src/store/reducer.ts`. Then functions are imported and components are able 
to use the hook to send data to Redux store:

````typescript
import { useDispatch } from "react-redux";
import {
    updateTaskPomodoro,
} from "@/store/reducer";

// ...
export function SomeComponent() {
    const dispatch = useDispatch()
    // ...
    dispatch(updateTaskPomodoro(currentPomodoro))
}
````

There function `updateTaskPomodoro` is an example of an action creator:

````typescript title="src/store/reducer.ts"
export const updateTaskPomodoro: ActionCreator<AnyAction> = (
    pomodoro: IPomodoro
) => ({
    type: UPDATE_TASK_POMODORO,
    pomodoro,
});
````

### Read Store Data

To get the data from Redux store Pomodoro uses `useSelector` hook:

````typescript title="src/containers/ProjectContainer/ProjectContainer.tsx"
import { useSelector } from "react-redux";
// ...
const currentTask = useSelector<RootState, ITask | undefined>((state) =>
    state.tasks.length > 0 ? state.tasks[0] : undefined
);
````

### Deprecation Notice

:::tip[Can be improved]
As Redux Toolkit takes place of Redux today, the state manager for Pomodoro
can be upgraded with RTK: [Why RTK?](https://redux.js.org/introduction/why-rtk-is-redux-today)
:::

## Cosmic

### Declaration

The new RTK store is declared the following way, note the `combineSlices` function, which is the most
prominent improvement over the previous Redux, allowing to collect data and RTK Query API slices:

```typescript title="src/lib/store.ts"
export const store = configureStore({
    reducer: combineSlices(rootSlice, cosmicApi),
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(cosmicApi.middleware)
})
```

### Root Application Data

The `rootSlice` here is created with `createSlice` function:

````typescript title="src/lib/store.ts"
export const rootSlice = createSlice({
    name: "rootStore",
    initialState: initialState,
    reducers: {
        setSelectedProject: (state: GlobalState, action: PayloadAction<Project>) => {
            state.selectedProject = action ? action.payload : undefined;
        },
        clearSelectedProject: (state: GlobalState) => {
            state.selectedProject = undefined;
        }
    }
  });
````

### Store Provider

After these basic steps are made, the new wrapper class `StoreProvider` can be declared as follows:
```typescript jsx title="src/lib/StoreProdiver.tsx"
import { Provider } from 'react-redux'
import { store } from './store'

export default function StoreProvider({
          children
        }: Readonly<{
          children: React.ReactNode
        }>) 
{
  return <Provider store={store}>{children}</Provider>
}
```
...and used once to render application routes:
````typescript jsx title="src/main.tsx"
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <StoreProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </StoreProvider>
    </StrictMode>
)
````

### Using A Typed `useDispatch` Hook

There can be declared a variable with the type of the particular application
data `dispatch` hook:

````typescript title="src/store.tsx"
export type AppDispatch = typeof store.dispatch
````
Use `AppDispatch` type to declare a typed hook:

````typescript title="src/lib/lib.ts"
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
````

This hook can be used by a component to dispatch a new value to Redux store:

````typescript jsx
import {useAppDispatch} from "@/lib/lib.ts"
// ...
export function SomeComponent() {
    const dispatch = useAppDispatch()
    // ...
    dispatch(setSelectedProject(project));    
}
````

### Read Store Data With A Typed Hook

There is a typed hook declared to assist in data reading:

````typescript title="src/store.tsx"
// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppState = ReturnType<typeof store.getState>
export const useAppSelector = useSelector.withTypes<AppState>()
````

It then can be used as follows, conveniently declaring type of the argument `state`:

````typescript
const selectedProject: Project = useAppSelector(
    (state: AppState) => state.rootStore.selectedProject
)
````

:::info[Learning Resources]
https://redux.js.org/introduction/learning-resources
:::