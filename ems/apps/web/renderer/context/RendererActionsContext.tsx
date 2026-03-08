'use client'

import React, { createContext, useContext } from 'react'

export interface RendererActions {
  onSelectChange?: (blockId: string, value: string) => void
  onTabChange?: (blockId: string, value: string) => void
}

const RendererActionsContext = createContext<RendererActions>({})

export function RendererActionsProvider({
  children,
  actions,
}: {
  children: React.ReactNode
  actions: RendererActions
}) {
  return (
    <RendererActionsContext.Provider value={actions}>
      {children}
    </RendererActionsContext.Provider>
  )
}

export function useRendererActions(): RendererActions {
  return useContext(RendererActionsContext)
}
