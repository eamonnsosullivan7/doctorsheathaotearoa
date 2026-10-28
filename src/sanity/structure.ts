import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('event').title('Events'),
      S.documentTypeListItem('news').title('News'),
      S.documentTypeListItem('teamMember').title('Team'),
      S.divider(),
      S.listItem()
        .title('Support page')
        .child(
          S.list()
            .title('Support page')
            .items([
              S.documentTypeListItem('supportCategory').title('Categories'),
              S.listItem()
                .title('Resources by category')
                .child(
                  S.documentTypeList('supportCategory')
                    .title('Resources by category')
                    .child((categoryId) =>
                      S.documentList()
                        .title('Resources')
                        .filter('_type == "supportResource" && category._ref == $categoryId')
                        .params({categoryId})
                        .defaultOrdering([{field: 'order', direction: 'asc'}])
                        .initialValueTemplates([
                          S.initialValueTemplateItem('supportResource-by-category', {categoryId}),
                        ]),
                    ),
                ),
              S.documentTypeListItem('supportResource').title('All resources'),
            ]),
        ),
    ])
