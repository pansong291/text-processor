///<reference types="react"/>

declare module 'react-object-view' {
  type ObjectViewProps = {
    data?: {}
    palette?: {}
    styles?: {}
    options?: {}
  }
  const ObjectView: React.FC<ObjectViewProps>
}
