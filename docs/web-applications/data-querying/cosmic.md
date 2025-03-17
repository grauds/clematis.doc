---
sidebar_position: 3
tags:
  - RTK_query
  - fetch_API
  - api_slice
  - RTK_cache
  - custom_react_hook
  - mutation
---

# Cosmic And RTK

Cosmic is using [Redux Toolkit Query](https://redux-toolkit.js.org/rtk-query/overview) to get
data from the Cosmic API Hateoas backend:

````typescript title="src/lib/store.ts"
export const store = configureStore({
    reducer: combineSlices(rootSlice, cosmicApi),
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(cosmicApi.middleware)
})
````

## Hateoas API Slice

Where `cosmicApi` is an [API Slice](https://redux-toolkit.js.org/rtk-query/api/created-api/redux-integration).
There can be more slices for every API used, all together combined with `configureStore`:

````typescript title="src/lib/features/cosmic/cosmicSlice.ts"
export const cosmicApi = createApi({
    reducerPath: 'cosmicApi',
    baseQuery: fetchBaseQuery({
        mode: 'cors',
        baseUrl: 'http://backend.address',
        headers: {
            Accept: 'application/hal+json'
        }
    })
    //..
})
````

### `EndpointBuilder`

Each slice sets up a number of endpoints which can be created with `EndpointBuilder`,
for example:

````typescript title="src/lib/features/cosmic/cosmicSlice.ts"
getProjectById: builder.query<Project, string>({
    query: (id) => `api/projects/${id}`
})
````

### Manual Creation Of An Endpoint

More complex or non-standard endpoints can be created manually. For example,
if we don't know the URL of the resource in advance, as it is coming from Hateoas response as
an absolute URL, the endpoint will just ignore the value of the `baseQuery.baseUrl`
in API and will use this absolute URL:

````typescript title="src/lib/features/cosmic/cosmicSlice.ts"
getProjectByUrl: builder.query<Project, string>({
    queryFn: async (url) => {
        const response = await fetch(
            `${url}`
        );
        const data: Project = await response.json();
        return { data };
    }
})
````
In fact, the whole conversation with Hypermedia backend is built on this principle, which
is a main feature of Hateoas and allows the UI to be decoupled from the resources' URLs implementation.

## Fetch API

RTK uses [`fetchBaseQuery`](https://redux-toolkit.js.org/rtk-query/api/fetchBaseQuery)
which is a thin wrapper around [fetch API](https://www.w3schools.com/js/js_api_fetch.asp).

## Typed Responses

As usually, for JSON to be parsed in a typed manner, there are a number of classes, including
the ones that cater for Hateoas responses with links, not just whose which describe
the business domain of the application:

````typescript title="src/lib/model.ts"
export type HateoasTypeCollection<K extends string, T> 
                 = { [P in K]: T[] } & {}

export class Page {
    size: number = 0;
    totalElements: number = 0;
    totalPages: number = 0;
    number: number = 0;
}

export type HateoasResponse<K extends string, T> = {
    _embedded: HateoasTypeCollection<K, T>;
    _links: HateoasLinks;
    page: Page;
}
````

## Cache Tags And Re-fetching

In the Cosmic API layer, get and search queries usually create cache tags, post and delete mutations
remove cache tags. This triggers [data re-fetching](https://redux-toolkit.js.org/rtk-query/usage/automated-refetching) for the queries with affected tags.

For example, when a list of projects is retrieved from the backend as a result of a
paginated search, a tag `Project` is set:

````typescript title="src/lib/features/cosmic/cosmicSlice.ts"
filterProjects: builder.query<HateoasResponse<'data', Project>, IFilteringPageable>({
    query: ({filter = '', page = 0, size = 5}) => `api/projects/search/filter?searchText=${filter}&sort=name&page=${page}&size=${size}`,
    providesTags: ['Project']
})
````

If a project is created, edited or removed, this tag is also removed:

````typescript  title="src/lib/features/cosmic/cosmicSlice.ts"
createProject: builder.mutation<Project, INewProjectProps>({
    query: ({ name, description }) => ({
        url: `api/projects`,
        method: 'POST',
        body: { name, description }
    }),
    invalidatesTags: ['Project']
})
````
The first query is repeated to update the cache and rerender the user interface. Tags
can be any string, it is up to the application, not to RTK itself,
to construct the relations between queries and mutations to keep the optimal cadence in data retrieval
and refresh.

## Generated React Hooks

The ready-to-use React hooks also provided by RTK, they are 
added to the `API` object itself and ready to be exported, for instance:

````typescript
export const {
    useLazyGetProjectByIdQuery,
    useLazyFilterProjectsQuery,
    useLazyGetProjectRunsQuery,
    useGetBalloonByUrlQuery,
    useCreateProjectMutation,
    useDeleteProjectMutation,
    useCopyInputDataMutation,
    useMoveInputDataMutation,
    useSaveInputDataMutation,
    useDeleteInputDataMutation,
    useCalculateMutation
} = cosmicApi
````
The general format is [use(Endpointname)(Query|Mutation)](https://redux-toolkit.js.org/rtk-query/api/created-api/hooks#hooks-overview) - 
use is prefixed, the first letter of your endpoint name is capitalized, 
then Query or Mutation is appended depending on the type.

## Query: Example Usage In A Component

There are two options for how the query hooks can be used depending on their type. Normal queries or mutations
are used as normal hooks on component render:

````typescript jsx title="src/containers/ProjectContainer/ProjectContainer.tsx"
import {
    useGetBalloonByUrlQuery,
    useLazyGetProjectRunsQuery
} from "@/lib/features/cosmic/cosmicSlice.ts";

export function ProjectContainer(props: Readonly<IProjectContainerProps>): React.JSX.Element {
 // Normal hook
    const {
        data: balloon
    } = useGetBalloonByUrlQuery(
        inputData._links.balloon.href ?? ''
    )
    
 // Lazy hook
    const [getProjectRuns, {data, isLoading}] = useLazyGetProjectRunsQuery()
    
 // Then it can be used in a effect hook
    useEffect(() => {
        if (selectedProject && selectedProject._links.runs.href) {
            getProjectRuns(selectedProject._links.runs.href);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProject]);
    
// Result data (and other info like status and errors) is then referenced later
    useEffect(() => {
        setSelectedData(
            (data as HateoasResponse<'data', InputData>)?._embedded.data
                .find(elem => elem.id === selectedData?.id)
        )
    }, [data, selectedData?.id]);
}
````

## Mutation: Example Usage In A Component

Mutation is 'lazy' by default, so it has only one scenario:

````typescript jsx title="src/containers/ProjectContainer/ProjectContainer.tsx" 
import {
    useCopyInputDataMutation
} from "@/lib/features/cosmic/cosmicSlice.ts";

export function ProjectContainer(props: Readonly<IProjectContainerProps>): React.JSX.Element {
    
    const [copyInputData] = useCopyInputDataMutation()
    
    //...
    
    function onClone(inputData: InputData): void {
        copyInputData({
            inputData: inputData,
            project: selectedProject,
        })
    }
}
````