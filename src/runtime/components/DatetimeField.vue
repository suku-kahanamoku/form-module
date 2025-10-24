<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date";
import { useLang } from "#imports";

import type { IItem } from "@suku-kahanamoku/common-module/types";
import { GET_OBJECT_PARAM } from "@suku-kahanamoku/common-module/utils";

import { useField } from "../composables/useField";
import type { IFormField, IFormFieldDatetime } from "../types";

// Definice props
const props = defineProps<{
  field: IFormFieldDatetime;
  item?: IItem;
  ui?: Record<string, any>;
}>();

// Definice emit eventu submit
const emits = defineEmits<{
  (e: "focus", event: FocusEvent, field: IFormField): void;
  (e: "blur", event: FocusEvent, field: IFormField): void;
  (e: "clear", field: IFormField): void;
  (e: "select", value: any, field: IFormField): void;
}>();

const { t } = useLang();

// Helper funkce pro field
const { compare } = useField();

// Model pro input, tzn. hodnota, ktera se odesila
const model = defineModel<Date | string>();

// Popover open state
const open = ref(false);

// Calendar model value - používá CalendarDate pro Nuxt UI Calendar
const calendarModel = ref<CalendarDate | undefined>();

// Date formatter pro zobrazení
const df = new DateFormatter("cs-CZ", {
  dateStyle: "medium",
});

// Zjisti zda puvodni hodnota a hodnota v input fieldu jsou rozdilne
const isDifferent = computed<Boolean>(() => {
  if (props.item) {
    const defaultValue = GET_OBJECT_PARAM(props.item, props.field.name);
    if (
      model.value &&
      model.value instanceof Date &&
      defaultValue &&
      !isNaN(Date.parse(defaultValue))
    ) {
      return compare(
        new Date(defaultValue)?.getTime(),
        model.value?.getTime(),
        props.field
      );
    }
    return compare(defaultValue, model.value, props.field);
  }
  return false;
});

// Convert Date to CalendarDate
const dateToCalendarDate = (date: Date): CalendarDate => {
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
};

// Convert CalendarDate to Date
const calendarDateToDate = (calendarDate: CalendarDate): Date => {
  return calendarDate.toDate(getLocalTimeZone());
};

// Min and max values pro calendar
const minValue = computed(() => {
  if (props.field.minDate) {
    const minDate =
      props.field.minDate instanceof Date
        ? props.field.minDate
        : new Date(props.field.minDate);
    return dateToCalendarDate(minDate);
  }
  return undefined;
});

const maxValue = computed(() => {
  if (props.field.maxDate) {
    const maxDate =
      props.field.maxDate instanceof Date
        ? props.field.maxDate
        : new Date(props.field.maxDate);
    return dateToCalendarDate(maxDate);
  }
  return undefined;
});

// Formatted display value
const displayValue = computed(() => {
  if (calendarModel.value) {
    return df.format(calendarModel.value.toDate(getLocalTimeZone()));
  }
  return t(props.field.placeholder || "$.form.select_date");
});

// Synchronizace mezi model a calendarModel
watch(calendarModel, (newCalendarDate) => {
  if (newCalendarDate) {
    const date = calendarDateToDate(newCalendarDate);
    model.value = date;
    emits("select", date, props.field);
    open.value = false;
  }
});

// Pokud se klikne na clear button, tak se smaze hodnota a provede se focus
const onClear = () => {
  model.value = "";
  calendarModel.value = undefined;
  emits("clear", props.field);
};

onMounted(() => {
  if (
    model.value &&
    !(model.value instanceof Date) &&
    !isNaN(Date.parse(model.value))
  ) {
    model.value = new Date(model.value);
  }

  // Inicializace calendarModel z model.value
  if (model.value instanceof Date) {
    calendarModel.value = dateToCalendarDate(model.value);
  } else if (
    typeof model.value === "string" &&
    model.value &&
    !isNaN(Date.parse(model.value))
  ) {
    const date = new Date(model.value);
    model.value = date;
    calendarModel.value = dateToCalendarDate(date);
  } else {
    model.value = "";
    calendarModel.value = undefined;
  }
});
</script>

<template>
  <UFormField
    :name="field.name"
    :label="t(field.label!)"
    :description="t(field.description!)"
    :hint="t(field.hint!)"
    :help="t(field.help!)"
    :size="field.size || 'xl'"
    :required="field.required"
    :ui="ui"
  >
    <!-- Slot pro label -->
    <template v-if="$slots.label" #label>
      <slot name="label" v-bind:field="field" v-bind:model="model" />
    </template>

    <!-- Slot pro description -->
    <template v-if="$slots.description" #description>
      <slot name="description" v-bind:field="field" v-bind:model="model" />
    </template>

    <!-- Slot pro hint -->
    <template #hint>
      <slot
        v-if="$slots.hint"
        name="hint"
        v-bind:field="field"
        v-bind:model="model"
      />
    </template>

    <!-- Slot pro help -->
    <template v-if="$slots.help" #help>
      <slot name="help" v-bind:field="field" v-bind:model="model" />
    </template>

    <!-- Date Picker Input -->
    <UPopover>
      <UButton
        color="neutral"
        variant="outline"
        icon="i-heroicons-calendar-days"
        :trailing-icon="
          open ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'
        "
        :disabled="field.disabled"
        :size="field.size || 'xl'"
        class="w-full justify-between"
        :class="{ 'field-warning': isDifferent }"
        @click="open = !open"
      >
        <span class="truncate">{{ displayValue }}</span>
      </UButton>

      <template #content>
        <div class="p-4">
          <UCalendar
            v-model="calendarModel"
            :color="field.color || 'primary'"
            :variant="field.variant || 'solid'"
            :size="field.size || 'md'"
            :disabled="field.disabled"
            :readonly="field.readonly"
            :min-value="minValue"
            :max-value="maxValue"
            class="w-full"
          />

          <!-- Clear button -->
          <div
            v-if="calendarModel && !field.required"
            class="flex justify-end mt-4 pt-4 border-t border-gray-200"
          >
            <UButton
              color="error"
              variant="soft"
              size="sm"
              icon="i-heroicons-x-mark"
              @click="onClear"
            >
              {{ t("$.btn.delete") }}
            </UButton>
          </div>
        </div>
      </template>
    </UPopover>
  </UFormField>
</template>
