<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    @reset="handleReset"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  import { ROUTING_TARGET_STATUS_OPTIONS, ROUTING_TARGET_TYPE_OPTIONS } from '../constants'
  import type { ChannelOption, RoutingRuleOption, SearchFormModel } from '../types'

  interface Props {
    modelValue: SearchFormModel
    routingRuleOptions: RoutingRuleOption[]
    channelOptions: ChannelOption[]
  }

  interface Emits {
    (e: 'update:modelValue', value: SearchFormModel): void
    (e: 'search', params: SearchFormModel): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const formItems = computed(() => [
    {
      label: '关键词',
      key: 'keyword',
      type: 'input',
      placeholder: '目标类型 / 目标键'
    },
    {
      label: '路由规则',
      key: 'routingRuleId',
      type: 'select',
      props: {
        placeholder: '全部规则',
        options: props.routingRuleOptions.map((item) => ({
          label: item.label,
          value: item.value
        })),
        filterable: true,
        clearable: true
      }
    },
    {
      label: '目标类型',
      key: 'targetType',
      type: 'select',
      props: {
        placeholder: '全部类型',
        options: ROUTING_TARGET_TYPE_OPTIONS,
        clearable: true
      }
    },
    {
      label: '渠道',
      key: 'channelId',
      type: 'select',
      props: {
        placeholder: '全部渠道',
        options: props.channelOptions.map((item) => ({
          label: item.label,
          value: item.value
        })),
        filterable: true,
        clearable: true
      }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '全部状态',
        options: ROUTING_TARGET_STATUS_OPTIONS,
        clearable: true
      }
    }
  ])

  const handleReset = () => emit('reset')

  const handleSearch = async (params: SearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
