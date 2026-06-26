export default {
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', title: 'Title' },
    { name: 'slug', type: 'slug', title: 'Slug', options: { source: 'title', maxLength: 96 } },
    { name: 'publishedAt', type: 'datetime', title: 'Published at' },
    { name: 'author', type: 'reference', to: [{ type: 'author' }] },
    { name: 'mainImage', type: 'image', title: 'Main image', options: { hotspot: true } },
    { name: 'excerpt', type: 'text', title: 'Excerpt' },
    { name: 'body', type: 'array', title: 'Body', of: [ { type: 'block' }, { type: 'image' } ] },
    { name: 'tags', type: 'array', of: [{ type: 'string' }], title: 'Tags' },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection: any) {
      const { author } = selection;
      return Object.assign({}, selection, { subtitle: author && `by ${author}` });
    },
  },
};
