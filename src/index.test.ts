import * as Path from 'path'
import * as Fs from 'fs'
import {
  convertToUnionType,
  getAllStylesFromFile,
  getBlockNameFromPath,
  combineExistingUnionsToAll,
  getExportKeys,
  exportBEMTypes,
  bulmaToBEM
} from './index'

const loadFile = (path: string) =>
  Fs.readFileSync(
    Path.join(__dirname, path),
    'utf8')

const NavBar = loadFile('fixture/Navbar.raw')
const Button = loadFile('fixture/Button.raw')
const Modifiers = loadFile('fixture/Modifiers.raw')

test('get export keys for Navbar', () => {
  const fileExportsKeys = getExportKeys(NavBar)
  expect(fileExportsKeys.length).toBe(8)
})

test('get block from file path', () => {
  const block = getBlockNameFromPath(Path.join(__dirname, '/fixture/Navbar.raw'))
  expect(block).toBe('navbar')
})

test('convert array to union types', () => {
  const fileExportsKeys = getExportKeys(NavBar)
  const sassOptions = getAllStylesFromFile(fileExportsKeys, 'navbar')
  const unions = convertToUnionType(sassOptions)
  expect(unions).toMatchSnapshot()
})

test('combine all variants to one type', () => {
  const fileExportsKeys = getExportKeys(NavBar)
  const sassOptions = getAllStylesFromFile(fileExportsKeys, 'navbar')
  const unions = convertToUnionType(sassOptions)
  const all = combineExistingUnionsToAll(unions)
  expect(all).toMatchSnapshot()
})

test('combine all variants to one type - when some of keys if missing', () => {
  const all = combineExistingUnionsToAll({ modifiers: 'isSth1 | isSth2' })
  expect(all).toMatchSnapshot()
})

test('get all bem styles as well as these which were not recognized', () => {
  const fileExportsKeys = getExportKeys(NavBar)
  const sassOptions = getAllStylesFromFile(fileExportsKeys, 'navbar')
  expect(sassOptions).toMatchSnapshot()
})

test('resolve variants, modifiers and elements from exports', () => {
  const fileExportsKeys = getExportKeys(NavBar)
  const sassOptions = bulmaToBEM(fileExportsKeys, 'navbar')
  expect(sassOptions).toMatchSnapshot()
})

test('export all segregated types as TS union types', () => {
  const fileExportsKeys = getExportKeys(NavBar)
  const sassOptions = bulmaToBEM(fileExportsKeys, 'navbar')
  const exportedTypes = exportBEMTypes(sassOptions)
  expect(exportedTypes).toMatchSnapshot()
})

test('when there is not elements', () => {
  const fileExportsKeys = getExportKeys(Button)
  const sassOptions = bulmaToBEM(fileExportsKeys)
  const exportedTypes = exportBEMTypes(sassOptions)
  expect(exportedTypes).toMatchSnapshot()
})

test('recognize exports when there is a number in name', () => {
  const fileExportsKeys = getExportKeys(Modifiers)
  expect(fileExportsKeys.length).toBe(6)
})