"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Pencil, Filter } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Memo {
  id: string;
  text: string;
  isDeleting: boolean;
  category: string;
}

// Available categories
const CATEGORIES = ["할 일", "아이디어", "기타"];

// Utility function to reorder items
const reorder = (list: Memo[], startIndex: number, endIndex: number): Memo[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export default function Home() {
  const [memoText, setMemoText] = useState("");
  const [memos, setMemos] = useState<Memo[]>([]);
  const [editingMemo, setEditingMemo] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>("할 일");
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted flag when component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load memos from localStorage when component mounts
  useEffect(() => {
    if (isMounted) {
      const savedMemos = localStorage.getItem("memos");
      if (savedMemos) {
        try {
          const parsedMemos = JSON.parse(savedMemos);
          // Ensure all memos have isDeleting property and category
          const validMemos = parsedMemos.map((memo: {id: string; text: string; category?: string}) => ({
            ...memo,
            isDeleting: false,
            category: memo.category || "기타"
          }));
          setMemos(validMemos);
        } catch (error) {
          console.error("Failed to parse saved memos:", error);
        }
      }
    }
  }, [isMounted]);

  // Save memos to localStorage whenever they change
  useEffect(() => {
    if (isMounted) {
      // Filter out any memos marked for deletion before saving
      const memosToSave = memos.filter(memo => !memo.isDeleting);
      localStorage.setItem("memos", JSON.stringify(memosToSave));
    }
  }, [memos, isMounted]);

  const handleAddMemo = () => {
    if (memoText.trim() !== "") {
      setMemos([...memos, { 
        id: Date.now().toString(), 
        text: memoText,
        isDeleting: false,
        category: currentCategory
      }]);
      setMemoText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddMemo();
    }
  };

  const handleDeleteMemo = (id: string) => {
    // Mark memo as deleting to trigger fade-out animation
    setMemos(memos.map(memo => 
      memo.id === id ? { ...memo, isDeleting: true } : memo
    ));
    
    // Remove memo after animation completes
    setTimeout(() => {
      setMemos(prevMemos => prevMemos.filter(memo => memo.id !== id));
    }, 300); // Match the animation duration
  };

  const handleEditMemo = (id: string) => {
    const memo = memos.find(m => m.id === id);
    if (memo) {
      setEditingMemo(id);
      setEditText(memo.text);
      setEditCategory(memo.category);
    }
  };

  const handleSaveEdit = () => {
    if (editingMemo && editText.trim() !== "") {
      setMemos(memos.map(memo => 
        memo.id === editingMemo ? { ...memo, text: editText, category: editCategory } : memo
      ));
      setEditingMemo(null);
      setEditText("");
      setEditCategory("");
    }
  };

  // 메모 색상 랜덤 선택 함수
  const getRandomColor = () => {
    const colors = [
      "bg-yellow-200 dark:bg-yellow-800", 
      "bg-pink-200 dark:bg-pink-800", 
      "bg-green-200 dark:bg-green-800"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Get filtered memos
  const getFilteredMemos = () => {
    if (!selectedCategory) return memos;
    return memos.filter(memo => memo.category === selectedCategory);
  };

  // Improved drag end handler
  const onDragEnd = (result: DropResult) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }
    
    // Reorder using utility function
    const reorderedMemos = reorder(
      memos,
      result.source.index,
      result.destination.index
    );
    
    setMemos(reorderedMemos);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 dark:bg-gray-900 transition-colors duration-200">
      <div className="w-full max-w-2xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-white">스티커 메모 앱</h1>
        <ThemeToggle />
      </div>
      
      {isMounted ? (
        <>
          <div className="w-full max-w-2xl flex flex-col gap-4 mb-8">
            <div className="flex gap-2">
              <Input
                value={memoText}
                onChange={(e) => setMemoText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메모를 입력하세요"
                className="flex-1 dark:bg-gray-800 dark:text-white dark:border-gray-700"
              />
              <Select
                value={currentCategory}
                onValueChange={setCurrentCategory}
              >
                <SelectTrigger className="w-[150px] dark:bg-gray-800 dark:text-white dark:border-gray-700">
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddMemo}
                variant="green"
              >
                추가
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium dark:text-white">
                {selectedCategory ? `${selectedCategory} 카테고리` : "모든 메모"}
              </h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-auto dark:bg-gray-800 dark:text-white dark:border-gray-700">
                    <Filter className="mr-2 h-4 w-4" />
                    필터
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>카테고리별 필터</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                    모든 메모
                  </DropdownMenuItem>
                  {CATEGORIES.map((category) => (
                    <DropdownMenuItem 
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable 
              droppableId="memo-list" 
              ignoreContainerClipping={false}
              isDropDisabled={false}
              isCombineEnabled={false}
            >
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="w-full max-w-4xl flex flex-wrap gap-4"
                >
                  {getFilteredMemos().map((memo, index) => {
                    const randomColor = getRandomColor();
                    const randomRotation = Math.random() * 6 - 3;
                    
                    return (
                      <Draggable 
                        key={memo.id} 
                        draggableId={memo.id} 
                        index={index}
                        isDragDisabled={false}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${randomColor} p-4 rounded-md shadow-md w-64 min-h-[150px] transition-all duration-300 ease-in-out ${
                              snapshot.isDragging ? 'scale-105 shadow-xl z-50' : 'hover:scale-105 hover:rotate-0 hover:shadow-lg'
                            } ${
                              memo.isDeleting ? 'opacity-0 scale-90' : 'opacity-100'
                            }`}
                            style={{
                              ...provided.draggableProps.style,
                              transform: `${provided.draggableProps.style?.transform || ''} rotate(${snapshot.isDragging ? 0 : randomRotation}deg)`,
                              boxShadow: snapshot.isDragging 
                                ? "0 5px 20px rgba(0,0,0,0.2)" 
                                : "2px 2px 10px rgba(0,0,0,0.1)"
                            }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-medium px-2 py-1 bg-black/10 dark:bg-white/10 rounded-full dark:text-gray-100">
                                {memo.category}
                              </span>
                            </div>
                            
                            {editingMemo === memo.id ? (
                              <div className="flex flex-col h-full">
                                <Input
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  autoFocus
                                  className="mb-2 bg-white/50 dark:bg-gray-800/50 dark:text-white"
                                />
                                <Select
                                  value={editCategory}
                                  onValueChange={setEditCategory}
                                >
                                  <SelectTrigger className="w-full mb-2 bg-white/50 dark:bg-gray-800/50 dark:text-white">
                                    <SelectValue placeholder="카테고리" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CATEGORIES.map((category) => (
                                      <SelectItem key={category} value={category}>
                                        {category}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <div className="flex justify-end mt-auto">
                                  <Button 
                                    onClick={handleSaveEdit}
                                    size="sm"
                                    variant="green"
                                  >
                                    저장
                                  </Button>
                                  <Button 
                                    onClick={() => setEditingMemo(null)}
                                    size="sm"
                                    variant="ghost"
                                    className="ml-2 dark:text-white dark:hover:bg-gray-700"
                                  >
                                    취소
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="whitespace-pre-wrap break-words mb-4 dark:text-gray-100">{memo.text}</p>
                                <div className="flex justify-end mt-auto">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="p-1 h-8 w-8 dark:text-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => handleEditMemo(memo.id)}
                                  >
                                    <Pencil size={16} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="p-1 h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                                    onClick={() => handleDeleteMemo(memo.id)}
                                  >
                                    <X size={16} />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </>
      ) : (
        <p className="dark:text-white">Loading...</p>
      )}
    </main>
  );
}
