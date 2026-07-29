"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@transcriptioneer/ui";
import { FileAudio, FileText, Pencil, Search, Tags, Trash2 } from "lucide-react";
import { useState } from "react";
import { Section, SubLabel } from "./section";

export function ModalsSection() {
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <Section id="modals" title="Modals and overlays">
      <div className="flex flex-wrap items-start gap-10">
        <div>
          <SubLabel>Modal</SubLabel>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Rename document</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rename document</DialogTitle>
                <DialogDescription>This updates the title everywhere it appears.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogTrigger asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogTrigger>
                <Button>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <SubLabel>Confirmation dialog</SubLabel>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete document</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this document?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the file, its transcript, and every extracted insight. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div>
          <SubLabel>Command palette</SubLabel>
          <Button variant="secondary" onClick={() => setCommandOpen(true)}>
            <Search className="size-4" />
            Open (⌘K)
          </Button>
          <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
            <CommandInput placeholder="Search or jump to…" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Documents">
                <CommandItem>
                  <FileAudio className="size-4 text-text-subtle" aria-hidden /> Q3 roadmap sync
                </CommandItem>
                <CommandItem>
                  <FileText className="size-4 text-text-subtle" aria-hidden /> Vendor security questionnaire
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        </div>

        <div>
          <SubLabel>Context menu</SubLabel>
          <ContextMenu>
            <ContextMenuTrigger className="flex h-24 w-56 items-center justify-center rounded-lg border border-dashed border-border-strong text-sm text-text-muted">
              Right-click this card
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>
                <Pencil className="size-4" aria-hidden /> Rename
              </ContextMenuItem>
              <ContextMenuItem>
                <Tags className="size-4" aria-hidden /> Edit tags
              </ContextMenuItem>
              <ContextMenuItem className="text-error focus:text-error">
                <Trash2 className="size-4" aria-hidden /> Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>

        <div>
          <SubLabel>Tooltip</SubLabel>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>Retrieval quality drives everything downstream.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Section>
  );
}
