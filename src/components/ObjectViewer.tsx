import { ObjectView } from 'react-object-view'
import React from 'react'

const palette = {}
const styles = {
  fontFamily: 'var(--font-family-mono)'
}

const ObjectViewer: React.FC<{ data: any }> = ({ data }) => {
  return <ObjectView data={data} styles={styles} palette={palette} />
}

export default ObjectViewer
