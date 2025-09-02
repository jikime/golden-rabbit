"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { X, Save, Loader2 } from "lucide-react"

interface Post {
  id: string
  imageUrl: string
  description: string
  tags: string[]
}

interface EditModalProps {
  post: Post | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (updatedPost: { description: string; tags: string[] }) => void
}

export function EditModal({ post, open, onOpenChange, onSave }: EditModalProps) {
  const [description, setDescription] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (post && open) {
      setDescription(post.description)
      setTags(post.tags)
      setTagInput("")
      setError(null)
    }
  }, [post, open])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSave = async () => {
    if (!post || !description.trim()) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/gallery/posts/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description.trim(),
          tags,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "게시물 수정에 실패했습니다.")
      }

      console.log("[v0] Post updated successfully:", result)

      onSave?.({ description: description.trim(), tags })
      onOpenChange(false)
    } catch (err) {
      console.error("[v0] Update error:", err)
      setError(err instanceof Error ? err.message : "수정 중 오류가 발생했습니다.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  if (!post) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Photo</Label>
            <div className="border border-border rounded-lg p-4">
              <img
                src={post.imageUrl || "/placeholder.svg"}
                alt="Post preview"
                className="max-h-48 mx-auto rounded-lg object-cover"
              />
              <p className="text-sm text-muted-foreground text-center mt-2">Image cannot be changed</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Write a description for your photo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="edit-tags"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button type="button" variant="outline" onClick={handleAddTag} disabled={!tagInput.trim()}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    #{tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!description.trim() || isSaving} className="flex-1">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
