// src/app/routes/RouteErrorBoundary.jsx
import React from 'react'
export default class RouteErrorBoundary extends React.Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(e,i){ console.error(e,i) }
  render(){ return this.state.hasError ? <div style={{padding:16}}>Ups, coś poszło nie tak.</div> : this.props.children }
}
