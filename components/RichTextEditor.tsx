'use client'

import { useState, useRef, useEffect } from 'react'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export default function RichTextEditor({ value, onChange, placeholder = '', rows = 5 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [])

  const handleInput = () => {
    if (editorRef.current) {
      let html = editorRef.current.innerHTML
      
      // Remove any anchor tags (hyperlinks)
      html = html.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1')
      
      // Convert to plain text with preserved formatting
      const text = htmlToText(html)
      onChange(text)
      
      // Update the editor content
      editorRef.current.innerHTML = html
    }
  }

  const htmlToText = (html: string): string => {
    // Create a temporary div to parse HTML
    const temp = document.createElement('div')
    temp.innerHTML = html
    
    // Convert HTML to text while preserving formatting
    let text = ''
    temp.childNodes.forEach((node) => {
      text += nodeToText(node)
    })
    
    return text.trim()
  }

  const nodeToText = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || ''
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement
      const tagName = element.tagName.toLowerCase()
      
      // Skip anchor tags
      if (tagName === 'a') {
        return Array.from(element.childNodes).map(nodeToText).join('')
      }
      
      // Preserve line breaks
      if (tagName === 'br') {
        return '\n'
      }
      
      // Preserve list items with bullets
      if (tagName === 'li') {
        const content = Array.from(element.childNodes).map(nodeToText).join('')
        return '• ' + content + '\n'
      }
      
      // Preserve list containers
      if (tagName === 'ul' || tagName === 'ol') {
        return Array.from(element.childNodes).map(nodeToText).join('')
      }
      
      // Preserve paragraph breaks
      if (tagName === 'p' || tagName === 'div') {
        const content = Array.from(element.childNodes).map(nodeToText).join('')
        return content + (content ? '\n' : '')
      }
      
      // Preserve bold, italic, etc
      return Array.from(element.childNodes).map(nodeToText).join('')
    }
    
    return ''
  }

  const applyFormat = (command: string) => {
    document.execCommand(command, false)
    editorRef.current?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-300">
        <button
          type="button"
          onClick={() => applyFormat('bold')}
          title="Bold (Ctrl+B)"
          className="p-2 hover:bg-gray-200 rounded transition"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('italic')}
          title="Italic (Ctrl+I)"
          className="p-2 hover:bg-gray-200 rounded transition"
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => applyFormat('insertUnorderedList')}
          title="Bullet List"
          className="p-2 hover:bg-gray-200 rounded transition"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('insertOrderedList')}
          title="Numbered List"
          className="p-2 hover:bg-gray-200 rounded transition"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        suppressContentEditableWarning
        style={{ minHeight: `${rows * 1.5}rem` }}
        className={`w-full px-4 py-3 focus:outline-none overflow-auto ${
          isFocused ? 'ring-2 ring-blue-400' : ''
        }`}
        data-placeholder={placeholder}
      />
    </div>
  )
}
