---
name: dnd-kit-sort-order
description: Best practices for implementing drag and drop reordering with dnd-kit and a SQL database sortOrder field.
---

# Handling Drag and Drop with `dnd-kit` and `sortOrder`

This skill defines the proper way to implement Drag and Drop logic using `@dnd-kit/sortable` when connected to a backend that uses an integer `sortOrder` field (like `drizzle-orm`).

## 1. Do Not Swap by Values (Collision Bug)
Never extract existing `sortOrder` values and re-map them dynamically using `.sort()` (e.g., `occupiedSorts[idx]`). 
If the database contains corrupted duplicate values (e.g., two items with `sortOrder: 0`), swapping via identical orders will cause JavaScript array `.sort()` and SQL `ORDER BY` to fallback to their stable IDs. This causes the visual drag to fail, and items snap back to their original position or jump to the bottom of the list.

## 2. Brute-Force New Unique Values
Instead of swapping existing values, calculate a safe minimum base value and assign entirely fresh, monotonically incrementing `sortOrder` values for the entire dropped category range.
```typescript
const minSort = Math.min(...filtered.map(d => Number(d.sortOrder) || 0));
const safeStart = Number.isFinite(minSort) ? minSort : 0;

// Shift exactly the dragged item in the array natively
const newFiltered = [...filtered];
const [moved] = newFiltered.splice(oldIndex, 1);
newFiltered.splice(newIndex, 0, moved);

// Generate flawless unique sequential orders (e.g. 10, 20, 30...)
const updates = newFiltered.map((d, idx) => ({ 
  id: d.id, 
  sortOrder: safeStart + (idx * 10) 
}));
```

## 3. Disconnect Optimistic Updates from TRPC Cache
Avoid writing optimistic data into a volatile TRPC cache like `utils.dishes.list.setData()`. TRPC automatic refetches (like window focus or `invalidate()` ping) can instantly wipe out optimistic updates and trigger `dnd-kit` to visually snap elements back mid-drag or immediately after dropping. 
Instead, wrap the fetched server data into a robust local React `useState` and apply the optimistic UI swap straight to the local reactive state!

## 4. Fix PointerSensor Lag on Drags
Add an `activationConstraint` to the `PointerSensor`. Without it, `dnd-kit` registers any instant mouse click as a full-fledged drag start, which queues dozens of element CSS transforms prematurely and locks the browser main thread (producing Console DOM Violation delays of 800ms+).
```typescript
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
);
```

## 5. Defensive Collision Checks
Always ensure you trap invalid drop targets to prevent the app from attempting mathematical arrays splices on `-1` index bounds.
```typescript
if (!over) {
  toast.error("Movimento não registrado: solte o prato exatamente em cima de outro.");
  return;
}
if (active.id === over.id) return;
```
