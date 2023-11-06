/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useLayoutEffect, useRef, useState } from 'react'
import cx from 'classnames'
import { Avatar, Icon, Layout, Popover, Tag, Text, useToggleOpen } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Intent, Menu, MenuItem } from '@blueprintjs/core'
import ReactMarkdown from 'react-markdown'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { AIChatActions } from '@common/constants/TrackingConstants'
import { useHarnessSupportBot } from 'services/notifications'
import { String, useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { SubmitTicketModal } from '@common/components/ResourceCenter/SubmitTicketModal/SubmitTicketModal'
import { useDeepCompareEffect, useLocalStorage } from '@common/hooks'
import css from './DocsChat.module.scss'

const CHAT_HISTORY_KEY = 'aida_chat_history'

interface Message {
  author: 'harness' | 'user'
  text: string
  timestamp?: number
}

const sampleMessages: Array<Message> = [
  {
    author: 'harness',
    text: 'Hi, I can search the Harness Docs for you. How can I help you?',
    timestamp: Date.now()
  }
]

interface UsefulOrNotProps {
  query: string
  answer: string
  openSubmitTicketModal: () => void
}

enum Vote {
  None,
  Up,
  Down
}

function UsefulOrNot({ query, answer, openSubmitTicketModal }: UsefulOrNotProps): JSX.Element {
  const { trackEvent } = useTelemetry()
  const [voted, setVoted] = useState<Vote>(Vote.None)

  return (
    <>
      <Layout.Horizontal flex={{ align: 'center-center' }}>
        <Text>
          <String stringID="common.isHelpful" />
        </Text>
        <button
          disabled={voted !== Vote.None}
          className={cx({ [css.votedUp]: voted === Vote.Up }, css.voteButton)}
          onClick={() => {
            trackEvent(AIChatActions.BotHelpful, { query, answer })
            setVoted(Vote.Up)
          }}
        >
          <String stringID="yes" />
        </button>
        <button
          disabled={voted !== Vote.None}
          className={cx({ [css.votedDown]: voted === Vote.Down }, css.voteButton)}
          onClick={() => {
            trackEvent(AIChatActions.BotNotHelpful, { query, answer })
            setVoted(Vote.Down)
          }}
        >
          <String stringID="no" />
        </button>
      </Layout.Horizontal>
      {voted === Vote.Down ? (
        <Layout.Horizontal spacing="small" flex={{ align: 'center-center' }}>
          <String stringID="common.csBot.ticketOnError" />
          <a href="javascript:;" onClick={openSubmitTicketModal}>
            <String stringID="common.clickHere" />
          </a>
        </Layout.Horizontal>
      ) : null}
    </>
  )
}

function DocsChat(): JSX.Element {
  const [userInput, setUserInput] = useState('')
  const { currentUserInfo } = useAppStore()
  const { getString } = useStrings()
  const messageList = useRef<HTMLDivElement>(null)
  const { mutate: askQuestion, loading } = useHarnessSupportBot({})
  const { trackEvent } = useTelemetry()
  const { isOpen, close: closeSubmitTicketModal, open: openSubmitTicketModal } = useToggleOpen()
  const [chatHistory, setChatHistory] = useLocalStorage<Array<Message>>(CHAT_HISTORY_KEY, [], sessionStorage)
  const [messages, setMessages] = useState<Array<Message>>(chatHistory.length > 0 ? chatHistory : sampleMessages)
  useTrackEvent(AIChatActions.ChatStarted, {})

  const getAnswer = async (oldMessages: Array<Message>, query: string): Promise<void> => {
    try {
      const answer = await askQuestion({ question: query })
      if (answer?.data?.response) {
        trackEvent(AIChatActions.AnswerReceived, {
          query,
          answer: answer?.data?.response
        })
      }
      setMessages([
        ...oldMessages,
        {
          author: 'harness',
          text: answer?.data?.response || 'Something went wrong'
        } as Message
      ])
    } catch (e) {
      setMessages([
        ...oldMessages,
        {
          author: 'harness',
          text: 'error'
        } as Message
      ])
    }
  }

  const handleUserInput: React.ChangeEventHandler<HTMLInputElement> = e => {
    setUserInput(e.target.value)
    e.preventDefault()
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmitClick: React.MouseEventHandler<HTMLButtonElement> = () => {
    handleSubmit()
  }

  const handleSubmit = (): void => {
    const userMessage = userInput.trim()

    if (!userMessage) return

    const newMessageList: Message[] = [
      ...messages,
      {
        author: 'user',
        text: userMessage,
        timestamp: Date.now()
      }
    ]

    setMessages(newMessageList)
    getAnswer(newMessageList, userMessage)
    setUserInput('')
  }

  useLayoutEffect(() => {
    // scroll to bottom on every message
    messageList.current?.scrollTo?.(0, messageList.current?.scrollHeight)
  }, [messages])

  useDeepCompareEffect(() => {
    setChatHistory(messages)
  }, [messages])

  const clearHistory = (): void => {
    sessionStorage.removeItem(CHAT_HISTORY_KEY)
    setMessages(sampleMessages)
  }

  const loadingMessage = (
    <div className={cx(css.messageContainer, css.harness)}>
      <Icon name="harness-copilot" size={30} className={css.aidaIcon} />
      <div className={cx(css.message, css.loader)}>
        <div className={css.dotflashing}></div>
      </div>
    </div>
  )

  return (
    <div className={css.container}>
      <Layout.Vertical spacing={'small'} className={css.header}>
        <Layout.Horizontal spacing={'small'} style={{ alignItems: 'center' }}>
          <Icon name="harness-copilot" size={32} />
          <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK}>
            <String stringID="common.csBot.title" />
          </Text>
          <Tag intent={Intent.PRIMARY}>
            <String stringID="common.csBot.beta" />
          </Tag>
        </Layout.Horizontal>
        <Layout.Horizontal spacing={'xsmall'} style={{ alignItems: 'center' }}>
          <String stringID="common.csBot.subtitle" />
          <a href="https://developer.harness.io" rel="noreferrer nofollow" target="_blank">
            <String stringID="common.csBot.hdh" />
          </a>
          <Icon name="main-share" size={12} />
        </Layout.Horizontal>
      </Layout.Vertical>
      <div className={css.messagesContainer} ref={messageList}>
        {messages.map((message, index) => {
          return (
            <div key={message.text + index}>
              <div
                className={cx(css.messageContainer, {
                  [css.harness]: message.author === 'harness',
                  [css.user]: message.author === 'user'
                })}
              >
                {message.author === 'harness' ? (
                  <Icon name="harness-copilot" size={30} className={css.aidaIcon} />
                ) : null}
                <div className={css.message}>
                  {message.text === 'error' ? (
                    <a href="javascript:;" onClick={openSubmitTicketModal} className={css.errorLink}>
                      {getString('common.csBot.errorMessage')}
                    </a>
                  ) : (
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  )}
                </div>
                {message.author === 'user' ? (
                  <Avatar size={'small'} name={currentUserInfo.name} email={currentUserInfo.email} hoverCard={false} />
                ) : null}
              </div>
              {message.author === 'harness' && index > 1 ? (
                <UsefulOrNot
                  answer={message.text}
                  query={messages[index - 1].text}
                  openSubmitTicketModal={openSubmitTicketModal}
                />
              ) : null}
            </div>
          )
        })}
        {loading ? loadingMessage : null}
      </div>
      <div className={css.inputContainer}>
        <Popover minimal>
          <button className={css.chatMenuButton}>
            <Icon name="menu" size={12} />
          </button>
          <Menu>
            <MenuItem text="Clear History" onClick={clearHistory} />
          </Menu>
        </Popover>
        <input
          type="text"
          autoFocus
          name="user-input"
          className={css.input}
          value={userInput}
          onChange={handleUserInput}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          placeholder={getString('common.csBot.placeholder')}
        />
        <button onClick={handleSubmitClick} className={css.submitButton}>
          <Icon name="pipeline-deploy" size={24} />
        </button>
      </div>
      <SubmitTicketModal isOpen={isOpen} close={closeSubmitTicketModal} />
    </div>
  )
}

export default DocsChat
