<script setup lang="ts">
import { computed } from "vue";

import type { IFormFieldSelect } from "../types";

// Definice props
const props = defineProps<{
  field: IFormFieldSelect;
  onRemove: (...args: any) => void;
  onClear: (...args: any) => void;
}>();

// Definice emit eventu submit
const emits = defineEmits<{
  (e: "click", value: any, field: IFormFieldSelect): void;
  (e: "remove", value: any, field: IFormFieldSelect): void;
}>();

const model = defineModel();

const option = computed(() =>
  Array.isArray(model.value)
    ? model.value?.map((val) => val.item)
    : model.value?.item
);
</script>

<template>
  <div
    class="w-full flex justify-between"
    :class="{ 'cursor-text': field.variant === 'none' }"
  >
    <!-- pokud je to multiple, tak zobrazi badge komponenty s event chip ikonami -->
    <template v-if="Array.isArray(option)">
      <!-- pokud ma nejakou hodnotu -->
      <div v-if="option.length" class="flex flex-wrap gap-2 -mb-1">
        <template v-for="opt in option">
          <UChip
            size="xl"
            color="error"
            @click.prevent.stop="emits('remove', opt?.value, field)"
          >
            <CmpTooltip v-if="opt?.item?.tooltip">
              <UBadge
                :label="$tt(opt?.label!)"
                rounded
                @click.prevent="emits('click', opt.value, field)"
              />

              <template #text>
                {{ opt.item?.tooltip }}
              </template>
            </CmpTooltip>
            <UBadge
              v-else
              :label="$tt(opt?.label!)"
              rounded
              @click.prevent="emits('click', opt?.value, field)"
            />

            <template #content>
              <!-- delete ikona -->
              <UIcon
                name="i-heroicons-x-mark"
                class="cursor-pointer"
                @click.prevent="onRemove(opt?.value)"
              />
            </template>
          </UChip>
        </template>
      </div>

      <!-- pokud neni vybrana zadna hodnota zobrazi placeholder -->
      <span v-else>
        {{
          field.variant === "none"
            ? ""
            : $tt(field.placeholder || "$.form.select")
        }}
      </span>
    </template>

    <!-- jinak zobrazi vybranou hodnotu -->
    <span v-else class="text-sm">
      {{
        $tt(
          option?.label ||
            (field.variant === "none"
              ? ""
              : field.placeholder || "$.form.select")
        )
      }}
    </span>
  </div>
</template>
