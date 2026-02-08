import type { Page } from "fumadocs-core/source";
import { loader } from "fumadocs-core/source";
import type { DocCollectionEntry } from "fumadocs-mdx/runtime/server";
import { pages } from "~:content/server";

export const pagesSource = loader({
  baseUrl: "/pages",
  // @ts-expect-error - fumadocs type compatibility issue
  source: pages.toFumadocsSource(),
});

interface SourceDataMap {
  pages: (typeof pages)["docs"][number];
}

type NonSerializableDataKeys =
  | "_exports"
  | "body"
  | "getMDAST"
  | "getText"
  | "structuredData"
  | "info"
  | "toc";

type SerializableDocData<T> = Omit<T, NonSerializableDataKeys>;

type Source<TName extends keyof SourceDataMap> = Omit<
  Page<DocCollectionEntry<TName, SourceDataMap[TName]>>,
  "data"
> & {
  data: SerializableDocData<SourceDataMap[TName]>;
};

export type PageSource = Source<"pages">;

export function mapSourceData<TName extends keyof SourceDataMap>(
  doc: DocCollectionEntry<TName, SourceDataMap[TName]>
): SerializableDocData<SourceDataMap[TName]> {
  const {
    _exports,
    body,
    getMDAST,
    getText,
    structuredData,
    info,
    toc,
    // @ts-ignore - fumadocs type compatibility issue
    ...serializableData
  } = doc;

  return serializableData as SerializableDocData<SourceDataMap[TName]>;
}
