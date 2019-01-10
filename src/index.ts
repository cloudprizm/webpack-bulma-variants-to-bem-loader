import { readFileSync, writeFileSync } from 'fs'
import { EOL } from 'os'
import { basename } from 'path'
import { mapWithKey, compact, reduce } from 'fp-ts/lib/Record'
import { some, none } from 'fp-ts/lib/Option'
import { loader } from 'webpack'

// INFO as parsing happen based on file from typings-for-css - need to keep the same filename
// @ts-ignore
import { filenameToTypingsFilename } from 'typings-for-css-modules-loader/lib/cssModuleToInterface'

const bulmaModifiersTest = /(is|has)[A-Z].*/
const bulmaBlockTest = /^([a-z]+)$/
const exportsRegEx = /([a-z^A-Z0-9]*)(:|:\ )/g
const getBulmaElements = (blockBEM: string) => new RegExp(`${blockBEM}[A-Z].*`)

export const getExportKeys = (content: string, keyRegex = exportsRegEx) => {
  let match: RegExpExecArray | null
  const keys: string[] = []

  while (match = keyRegex.exec(content)) {
    if (keys.indexOf(match[1]) < 0) {
      keys.push(match[1])
    }
  }

  return keys
}

const capitalize = (s: string | unknown) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const toType = (key: string, arr: string[]) => {
  const leftSide = capitalize(key)
  const rightSide = arr.map(x => `"${x}"`).join(' | ')
  return `type ${leftSide} = ${rightSide}`
}

const computedValuesDiff =
  (universum: string[], subset: string[]) =>
    universum.filter(a => subset.indexOf(a) === -1)

interface BulmaBEM<K = string[]> {
  elements?: K
  block?: K
  modifiers?: K
  others?: K
}

export const bulmaToBEM = (fileExports: string[], blockBEM: string = ''): BulmaBEM => {
  const block = fileExports.filter(x => bulmaBlockTest.test(x))
  const modifiers = fileExports.filter(x => bulmaModifiersTest.test(x))
  const elements = blockBEM ? fileExports.filter(x => getBulmaElements(blockBEM).test(x)) : undefined
  return { elements, block, modifiers }
}

export const notRecognizedVariant = (bulmaBEM: BulmaBEM, universum: string[]) =>
  computedValuesDiff(
    universum,
    reduce(
      bulmaBEM as { [key: string]: string[] },
      [] as string[],
      (acc, val) => val ? acc.concat(val) : acc)
  )

export const getAllStylesFromFile = (fileExports: string[], blockBEM: string) => {
  const bulmaBEM = bulmaToBEM(fileExports, blockBEM)
  return ({
    ...bulmaBEM,
    others: notRecognizedVariant(bulmaBEM, fileExports)
  })
}

export const convertToUnionType = (bulmaBEM: BulmaBEM) =>
  mapWithKey({ ...bulmaBEM }, (key, val) =>
    val && val.length
      ? toType(key, val || [])
      : null
  )

export const combineExistingUnionsToAll = (bulmaBem: Partial<BulmaBEM<string>>) => {
  const existingTypes = compact(mapWithKey(bulmaBem, (a, b) => b ? some(a) : none))
  const typesNames = Object.keys(existingTypes).map(d => capitalize(d)).join(' | ')
  return `type All = ${typesNames}`
}

export const getBlockNameFromPath = (filePath: string) =>
  basename(filePath).split('.')[0].toLowerCase()

export const exportBEMTypes = (unionTypes: BulmaBEM) => {
  const unions = convertToUnionType(unionTypes)
  const existingUnionsAsAll = combineExistingUnionsToAll(unions)
  const unionValues = Object.values(unions).filter(Boolean)

  return unionValues
    .concat([existingUnionsAsAll])
    .map(d => `export ${d}`)
}

// TODO it has to be implemented to not overwrite file all the time
// this really su**

// @ts-ignore
const compareWithBaseFileAndSaveIfChanged =
  (filename: string, content: string, enrichedContent: string) =>
    readFileSync(filename, 'utf-8') !== content
    && writeFileSync(filename, enrichedContent, 'utf-8')

export default function (this: loader.LoaderContext, content: string) {
  if (this.cacheable) this.cacheable()

  const filePath = filenameToTypingsFilename(this.resourcePath)
  const sassExports = readFileSync(filePath, 'utf-8')

  const blockBEM = getBlockNameFromPath(filePath)
  const exports = getExportKeys(sassExports, exportsRegEx)
  const bulmaBEM = getAllStylesFromFile(exports, blockBEM)

  const newContent = [sassExports]
    .concat(exportBEMTypes(bulmaBEM))
    .concat([
      `export type BEM = Record<All, boolean>`,
      `declare let module: Record<All, string>`,
      `export default module`,
    ]).join(EOL)

  writeFileSync(filePath, newContent, 'utf-8')

  return content
}
