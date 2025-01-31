---
sidebar_position: 2
tags:
  - react
  - styles
  - css
  - sass
  - lessß
---
# Pass additional styles as props

It is often required to change colours, borders and other elements in the descendant components if compared to the base version of the component used. It's a rather simple task with object spread syntax with `CSSModuleClasses` type:

```typescript jsx
import styles from './styles.module.css'

export interface IDialogButtonsProps {
    moreStyles?: CSSModuleClasses
    //...
}

export function DialogButtons({
    moreStyles
    //...
}: Readonly<IDialogButtonsProps>): React.JSX.Element {

    const styled: CSSModuleClasses = {...styles, ...moreStyles}

    return <>
        <div className={styled.buttons}>
        //...
        </div>    
    </>
}    

```

Thanks to [CSS modules support](../clematis-explained/styling#css-modules-1)