/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(arg: unknown): arg is Function {
  return typeof arg === 'function'
}

export function useLocalStorage<T>(
  key: string,
  initalValue: T,
  storage: Storage = window.localStorage
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState(() => {
    try {
      const item = storage.getItem(key)

      return item && item !== 'undefined' ? JSON.parse(item) : initalValue
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
      return initalValue
    }
  })

  useEffect(() => {
    try {
      storage.setItem(key, JSON.stringify(state))
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  }, [state])

  function setItem(value: SetStateAction<T>): void {
    setState(value)
  }

  return [state, setItem]
}
