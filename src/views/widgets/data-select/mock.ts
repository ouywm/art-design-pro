import type {
  DataSelectColumn,
  DataSelectRecord
} from '@/components/core/forms/art-data-select/types'

export const companyColumns: DataSelectColumn[] = [
  { prop: 'name', label: '公司名称', minWidth: 220 },
  { prop: 'city', label: '城市', width: 110 },
  { prop: 'owner', label: '负责人', width: 110 },
  { prop: 'status', label: '状态', width: 100 }
]

export const warehouseColumns: DataSelectColumn[] = [
  { prop: 'name', label: '仓库名称', minWidth: 190 },
  { prop: 'city', label: '城市', width: 110 },
  { prop: 'capacity', label: '容量', width: 110 }
]

export const projectColumns: DataSelectColumn[] = [
  { prop: 'name', label: '项目名称', minWidth: 210 },
  { prop: 'owner', label: '负责人', width: 110 },
  { prop: 'city', label: '城市', width: 110 },
  { prop: 'status', label: '阶段', width: 110 }
]

const cities = ['洛阳市', '泉州市', '宁波市', '合肥市', '青岛市', '成都市', '苏州市', '西安市']
const owners = ['谢闻舟', '秦砚', '乔若溪', '林知远', '沈听白', '许南枝', '顾临川', '周砚宁']
const statuses = ['试运行', '扩展中', '稳定运营', '待验收']
const prefixes = ['砚川装备', '简仓即时零售', '云麓医药', '星河供应链', '松墨科技', '岚舟物流']

export const companyData: DataSelectRecord[] = Array.from({ length: 42 }, (_, index) => {
  const city = cities[index % cities.length]
  const prefix = prefixes[index % prefixes.length]
  return {
    id: index + 1,
    name: `${city.slice(0, 2)}${prefix}${index % 3 === 0 ? '股份' : '集团'}有限公司`,
    city,
    owner: owners[index % owners.length],
    status: statuses[index % statuses.length]
  }
})

export const warehouseData: DataSelectRecord[] = Array.from({ length: 18 }, (_, index) => {
  const city = cities[index % cities.length]
  return {
    id: `w-${index + 1}`,
    name: `${city.slice(0, 2)}${index % 2 === 0 ? '前置调拨仓' : '恒温履约仓'}`,
    city,
    capacity: `${1200 + index * 160} m2`
  }
})

export const regionTreeData: DataSelectRecord[] = [
  {
    id: 'east',
    name: '华东大区',
    children: [
      { id: 'ningbo', name: '宁波湾组' },
      { id: 'suzhou', name: '苏州集运组' },
      { id: 'hefei', name: '合肥医药组' }
    ]
  },
  {
    id: 'central',
    name: '华中大区',
    children: [
      { id: 'luoyang', name: '洛阳组' },
      { id: 'wuhan', name: '武汉周转组' }
    ]
  },
  {
    id: 'south',
    name: '华南大区',
    children: [
      { id: 'quanzhou', name: '泉州组' },
      { id: 'shenzhen', name: '深圳履约组' }
    ]
  }
]

export const projectData: DataSelectRecord[] = [
  { id: 'p-1', name: '装备巡检闭环试点', owner: '谢闻舟', city: '洛阳市', status: '试运行' },
  { id: 'p-2', name: '跨境集拼效率提升', owner: '秦砚', city: '泉州市', status: '扩展中' },
  { id: 'p-3', name: '医药恒温履约计划', owner: '乔若溪', city: '合肥市', status: '稳定运营' },
  { id: 'p-4', name: '区域调拨波次优化', owner: '林知远', city: '宁波市', status: '待验收' }
]
