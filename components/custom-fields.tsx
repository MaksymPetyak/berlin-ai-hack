'use client';

import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { useState } from "react";

type CustomField = [string, string | number];

export function CustomFields({ initialFields = {} }: { initialFields: Record<string, string | number> }) {
  const [newFields, setNewFields] = useState<CustomField[]>([]);

  const addField = () => {
    setNewFields([...newFields, ['', '']]);
  };

  const removeField = (index: number) => {
    setNewFields(newFields.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* Existing Custom Fields */}
      {Object.entries(initialFields).map(([key, value]) => (
        <div key={key} className="mb-4">
          <label 
            htmlFor={`custom_${key}`}
            className="block text-sm font-medium text-foreground mb-2"
          >
            {key}
          </label>
          <div className="flex gap-4">
            <input
              type="hidden"
              name="custom_keys[]"
              value={key}
            />
            <input
              type="text"
              id={`custom_${key}`}
              name="custom_values[]"
              defaultValue={value.toString()}
              className="w-full px-4 py-2 border rounded-md bg-background"
              placeholder="Value"
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                const container = document.getElementById(`custom_${key}`)?.parentElement?.parentElement;
                if (container) container.remove();
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      {/* Add New Custom Fields Section */}
      <div className="border-t pt-4 mt-4">
        <h2 className="text-lg font-medium mb-4">Add Custom Fields</h2>
        <div className="space-y-4">
          {newFields.map(([key, value], index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Field Name
                </label>
                <input
                  type="text"
                  name="custom_keys[]"
                  defaultValue={key}
                  className="w-full px-4 py-2 border rounded-md bg-background"
                  placeholder="Field name"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Value
                </label>
                <input
                  type="text"
                  name="custom_values[]"
                  defaultValue={value.toString()}
                  className="w-full px-4 py-2 border rounded-md bg-background"
                  placeholder="Value"
                />
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => removeField(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addField}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Field
          </Button>
        </div>
      </div>
    </>
  );
}
