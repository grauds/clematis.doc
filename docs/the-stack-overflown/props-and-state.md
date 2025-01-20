# Update state from props

Initial value for state is only used for the first render of the component, all subsequent renders ignore the initial state value and take the current value from state to render the component. Thus, to re-initialize the state again from the changing props, for example, from the parent component, one should use effect like in the following example:

```typescript
export function InputDataForm({
    inputData,
}: Readonly<IInputDataFormProps>): React.JSX.Element {

    const [inputDataCopy, setInputDataCopy] = useState<InputData>(inputData);

    useEffect(() => {
        setInputDataCopy(inputData);
    }, [inputData])

    ...

```

From [React, useState](https://react.dev/reference/react/useState#usestate):
>
> initialState: The value you want the state to be initially. It can be a value of any type, but there > is a special behavior for functions. This argument is ignored after the initial render.
