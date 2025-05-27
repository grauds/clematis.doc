---
tags:
  - react
  - state
---
# Update State From Props

Initial value for state is only used for the first render of the component, all later renders ignore the initial state
value and take the current value from the state to render the component. Thus, to re-initialize the state again from the 
changing props, for example, from the parent component, one should use an effect like in the following example:

```typescript jsx
export function InputDataForm({
    inputData,
}: Readonly<IInputDataFormProps>): React.JSX.Element {

    const [inputDataCopy, setInputDataCopy] = useState<InputData>(inputData);

    useEffect(() => {
        setInputDataCopy(inputData);
    }, [inputData]);

    //...
}
```

From [React, useState](https://react.dev/reference/react/useState#usestate):
>
> initialState: The value you want to initialize the state with. 
> It can be a value of any type, but there > is a special behavior for functions.
> This argument is ignored after the initial render.
