'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Key, Trash2, Edit2, Check, AlertCircle, Coins, RefreshCw } from 'lucide-react'
import { useMutation, useQuery, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'

export function FirecrawlKeyManager() {
  const [isEditing, setIsEditing] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenUsage, setTokenUsage] = useState<{ remaining_tokens?: number; error?: string } | null>(null)
  const [isLoadingTokens, setIsLoadingTokens] = useState(false)
  
  const firecrawlKey = useQuery(api.firecrawlKeys.getUserFirecrawlKey)
  const setFirecrawlKey = useMutation(api.firecrawlKeys.setFirecrawlKey)
  const deleteFirecrawlKey = useMutation(api.firecrawlKeys.deleteFirecrawlKey)
  const getTokenUsage = useAction(api.firecrawlKeys.getTokenUsage)
  
  // Fetch token usage when component mounts and key exists
  useEffect(() => {
    if (firecrawlKey?.hasKey) {
      fetchTokenUsage()
    }
  }, [firecrawlKey?.hasKey])
  
  const fetchTokenUsage = async () => {
    setIsLoadingTokens(true)
    try {
      const result = await getTokenUsage()
      if (result.success) {
        setTokenUsage({ remaining_tokens: result.remaining_tokens })
      } else {
        setTokenUsage({ error: result.error })
      }
    } catch (err) {
      setTokenUsage({ error: 'Failed to fetch token usage' })
    } finally {
      setIsLoadingTokens(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    try {
      await setFirecrawlKey({ apiKey })
      setSuccess(true)
      setTimeout(() => {
        setIsEditing(false)
        setApiKey('')
        setSuccess(false)
        // Fetch token usage for the new key
        fetchTokenUsage()
      }, 1500)
    } catch (err) {
      setError((err as Error).message || 'Failed to save API key')
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete your Firecrawl API key?')) {
      try {
        await deleteFirecrawlKey()
      } catch (err) {
        setError((err as Error).message || 'Failed to delete API key')
      }
    }
  }

  if (!firecrawlKey?.hasKey && !isEditing) {
    return (
      <div className="p-6 border border-dashed border-gray-300 rounded-lg text-center">
        <Key className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Firecrawl API Key</h3>
        <p className="text-sm text-gray-500 mb-4">
          Add your API key to enable website monitoring
        </p>
        <Button onClick={() => setIsEditing(true)} variant="orange">
          Add API Key
        </Button>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="p-6 border border-gray-200 rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              Firecrawl API Key
            </label>
            <Input
              id="apiKey"
              type="password"
              placeholder="fc-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Get your API key from{' '}
              <a 
                href="https://www.firecrawl.dev/app/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 underline"
              >
                firecrawl.dev
              </a>
            </p>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button type="submit" variant="orange" disabled={!apiKey}>
              {success ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                'Save Key'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                setApiKey('')
                setError('')
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="p-6 border border-gray-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Firecrawl API Key</h3>
          <p className="text-sm text-gray-500">
            Key: {firecrawlKey?.maskedKey}
          </p>
          {firecrawlKey?.lastUsed && (
            <p className="text-xs text-gray-400 mt-1">
              Last used: {new Date(firecrawlKey.lastUsed).toLocaleDateString()}
            </p>
          )}
          
          {/* Token Usage Display */}
          <div className="mt-3 flex items-center gap-2">
            {isLoadingTokens ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading tokens...
              </div>
            ) : tokenUsage?.remaining_tokens !== undefined ? (
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">
                  {tokenUsage.remaining_tokens.toLocaleString()} tokens remaining
                </span>
                <Button
                  onClick={fetchTokenUsage}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            ) : tokenUsage?.error ? (
              <p className="text-xs text-red-500">{tokenUsage.error}</p>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}