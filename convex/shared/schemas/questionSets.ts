import { defineTable } from "convex/server";
import { v } from "convex/values";

export const questionSetsTable = defineTable({
  setId: v.string(), // "lecture_evaluation" 等の識別子
  name: v.string(),
  description: v.string(),
  isActive: v.boolean(),
  sortOrder: v.number(),
  requiresEventName: v.boolean(),

  questions: v.array(
    v.object({
      questionId: v.string(),
      questionText: v.string(),
      questionType: v.union(
        v.literal("radio"),
        v.literal("checkbox"),
        v.literal("text"),
      ),
      isRequired: v.boolean(),
      options: v.optional(
        v.array(
          v.object({
            value: v.string(),
            label: v.string(),
            sortOrder: v.number(),
          }),
        ),
      ),
    }),
  ),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_set_id", ["setId"])
  .index("by_active", ["isActive"])
  .index("by_sort_order", ["sortOrder"]);
