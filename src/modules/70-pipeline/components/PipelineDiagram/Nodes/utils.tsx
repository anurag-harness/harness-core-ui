/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isNumber } from 'lodash-es'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { dragPlaceholderImageBase64 } from './assets/dragImageBase64'
import { dragStagePlaceholderImageBase64 } from './assets/dragStageImageBase64'
import defaultCss from './DefaultNode/DefaultNode.module.scss'

interface DotNotationPathProps {
  identifier: string
  entityType?: string
  baseDotNotation?: string
}

export enum NodeEntity {
  STAGE = 'STAGE',
  STEP = 'STEP'
}
export enum NodeWrapperEntity {
  step = 'step',
  stepGroup = 'stepGroup',
  stage = 'stage'
}

export const COLLAPSED_MATRIX_NODE_LENGTH = 8
export const MAX_ALLOWED_MATRIX_COLLAPSED_NODES = 4
export const DEFAULT_MATRIX_PARALLELISM = 1

export const getPositionOfAddIcon = (props: any, isRightNode?: boolean): string => {
  if (isRightNode) {
    return '-40px'
  }
  if (props?.children?.length) {
    if (props?.prevNode?.children?.length) {
      return '-65px'
    }
    if (props?.prevNode) return '-58px'
  }
  if (props?.prevNode?.children?.length) {
    return '-58px'
  }
  if (props?.parentIdentifier && !props.prevNode) {
    return '-35px'
  }
  return '-50px'
}

export const transformMatrixLabels = (nodeData: string): string => {
  const parsedNodeName = {}
  try {
    // if object parse to yaml
    const parsedVal = JSON.parse(nodeData)
    if (parsedVal && !isNumber(parsedVal)) {
      Object.assign(parsedNodeName, parsedVal)
      return yamlStringify(parsedNodeName, { indent: 4 })
    } else {
      return JSON.stringify(nodeData)
    }
  } catch (_e) {
    // name is string/number, parse it to string
    return JSON.stringify(nodeData)
  }
}

export const attachDragImageToEventHandler = (event: React.DragEvent<HTMLDivElement>, type?: NodeEntity): void => {
  // set drag image preview to custom icon in case of safari browser, as safari blocks image preview if dom tree have transform property on any parent
  if (navigator.userAgent.search('Safari') >= 0 && navigator.userAgent.search('Chrome') < 0) {
    const dragImage = document.createElement('img')
    dragImage.src = type === NodeEntity.STAGE ? dragStagePlaceholderImageBase64 : dragPlaceholderImageBase64
    dragImage.style.position = 'absolute'
    dragImage.style.left = '-100%'

    document.body.append(dragImage)
    setTimeout(() => dragImage.remove(), 0)

    event.dataTransfer.setDragImage(dragImage, dragImage.width / 2, dragImage.height / 2)
  }
}

export const getEntityIdentifierBasedDotNotationPath = ({
  baseDotNotation,
  identifier,
  entityType = NodeWrapperEntity.step
}: DotNotationPathProps): string => {
  return `${baseDotNotation}.${entityType}.${identifier}`
}

export const getBaseDotNotationWithoutEntityIdentifier = (dotNotation = ''): string => {
  const lastDotIndex = dotNotation.lastIndexOf('.')
  return lastDotIndex !== -1 ? dotNotation.substring(0, lastDotIndex) : dotNotation
}

export const getConditionalClassName = (isDisabled: boolean, className?: string): { className?: string } => {
  return isDisabled ? { className: defaultCss.disabledIcon } : className ? { className } : {}
}
