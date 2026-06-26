import { getSupabaseAdmin } from './supabase';

type AnyRecord = Record<string, any>;

function toSerializable(value: any): any {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => toSerializable(item));
  }

  if (value && typeof value === 'object') {
    const output: AnyRecord = {};
    for (const [key, child] of Object.entries(value)) {
      output[key] = toSerializable(child);
    }
    return output;
  }

  return value;
}

function cleanData(data: AnyRecord = {}): AnyRecord {
  const cleaned: AnyRecord = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleaned[key] = toSerializable(value);
    }
  }
  return cleaned;
}

function pickSelected(row: AnyRecord, select?: AnyRecord): AnyRecord {
  if (!select) {
    return row;
  }

  const picked: AnyRecord = {};
  for (const [key, enabled] of Object.entries(select)) {
    if (enabled) {
      picked[key] = row[key];
    }
  }
  return picked;
}

function applyWhere(query: any, where: AnyRecord = {}): any {
  let nextQuery = query;

  for (const [key, rawValue] of Object.entries(where)) {
    if (rawValue === undefined) {
      continue;
    }

    if (rawValue === null) {
      nextQuery = nextQuery.is(key, null);
      continue;
    }

    if (
      typeof rawValue === 'object' &&
      !Array.isArray(rawValue) &&
      !(rawValue instanceof Date)
    ) {
      if (typeof rawValue.contains === 'string') {
        nextQuery = nextQuery.ilike(key, `%${rawValue.contains}%`);
      }
      if (rawValue.gte !== undefined) {
        nextQuery = nextQuery.gte(key, toSerializable(rawValue.gte));
      }
      if (rawValue.lte !== undefined) {
        nextQuery = nextQuery.lte(key, toSerializable(rawValue.lte));
      }
      if (rawValue.gt !== undefined) {
        nextQuery = nextQuery.gt(key, toSerializable(rawValue.gt));
      }
      if (rawValue.lt !== undefined) {
        nextQuery = nextQuery.lt(key, toSerializable(rawValue.lt));
      }
      if (Array.isArray(rawValue.in)) {
        nextQuery = nextQuery.in(key, rawValue.in.map((item: any) => toSerializable(item)));
      }
      continue;
    }

    nextQuery = nextQuery.eq(key, toSerializable(rawValue));
  }

  return nextQuery;
}

function applyOrder(query: any, orderBy?: AnyRecord): any {
  if (!orderBy) {
    return query;
  }

  let nextQuery = query;
  for (const [column, direction] of Object.entries(orderBy)) {
    nextQuery = nextQuery.order(column, { ascending: direction !== 'desc' });
  }

  return nextQuery;
}

function applyPagination(query: any, take?: number, skip?: number): any {
  if (typeof take === 'number') {
    const from = Math.max(skip ?? 0, 0);
    const to = from + Math.max(take, 1) - 1;
    return query.range(from, to);
  }

  if (typeof skip === 'number' && skip > 0) {
    return query.range(skip, skip + 9999);
  }

  return query;
}

async function fetchUsersByIds(ids: string[], select?: AnyRecord): Promise<Map<string, AnyRecord>> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return new Map();
  }

  const fields = select
    ? Object.keys(select).filter((key) => select[key])
    : ['id', 'name', 'email'];

  if (!fields.includes('id')) {
    fields.unshift('id');
  }

  const { data, error } = await getSupabaseAdmin()
    .from('User')
    .select(fields.join(','))
    .in('id', uniqueIds);

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  const map = new Map<string, AnyRecord>();
  for (const row of data ?? []) {
    map.set(row.id as string, pickSelected(row, select));
  }

  return map;
}

async function fetchPostsByIds(ids: string[], select?: AnyRecord): Promise<Map<string, AnyRecord>> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return new Map();
  }

  const fields = select
    ? Object.keys(select).filter((key) => select[key])
    : ['id', 'title'];

  if (!fields.includes('id')) {
    fields.unshift('id');
  }

  const { data, error } = await getSupabaseAdmin()
    .from('Post')
    .select(fields.join(','))
    .in('id', uniqueIds);

  if (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }

  const map = new Map<string, AnyRecord>();
  for (const row of data ?? []) {
    map.set(row.id as string, pickSelected(row, select));
  }

  return map;
}

async function attachPostIncludes(rows: AnyRecord[], include?: AnyRecord): Promise<AnyRecord[]> {
  if (!include || rows.length === 0) {
    return rows;
  }

  const postIds = rows.map((row) => row.id as string);
  const authorIds = rows.map((row) => row.authorId as string).filter(Boolean);

  const authorMap = include.author
    ? await fetchUsersByIds(authorIds, include.author.select)
    : new Map<string, AnyRecord>();

  const commentCounts = new Map<string, number>();
  const likeCounts = new Map<string, number>();
  const photosByPost = new Map<string, AnyRecord[]>();

  if (include._count?.select?.comments) {
    const { data, error } = await getSupabaseAdmin()
      .from('Comment')
      .select('postId')
      .in('postId', postIds);

    if (error) {
      throw new Error(`Failed to count post comments: ${error.message}`);
    }

    for (const row of data ?? []) {
      const id = row.postId as string;
      commentCounts.set(id, (commentCounts.get(id) ?? 0) + 1);
    }
  }

  if (include._count?.select?.likes) {
    const { data, error } = await getSupabaseAdmin()
      .from('Like')
      .select('postId')
      .in('postId', postIds);

    if (error) {
      throw new Error(`Failed to count post likes: ${error.message}`);
    }

    for (const row of data ?? []) {
      const id = row.postId as string;
      if (!id) {
        continue;
      }
      likeCounts.set(id, (likeCounts.get(id) ?? 0) + 1);
    }
  }

  if (include.photos) {
    let photoQuery = getSupabaseAdmin().from('Photo').select('*').in('postId', postIds);
    photoQuery = applyOrder(photoQuery, include.photos.orderBy);

    const { data: photos, error: photosError } = await photoQuery;
    if (photosError) {
      throw new Error(`Failed to fetch post photos: ${photosError.message}`);
    }

    for (const photo of photos ?? []) {
      const postId = photo.postId as string;
      if (!postId) {
        continue;
      }
      const current = photosByPost.get(postId) ?? [];
      current.push(photo);
      photosByPost.set(postId, current);
    }
  }

  return rows.map((row) => {
    const enriched = { ...row };

    if (include.author) {
      enriched.author = row.authorId ? (authorMap.get(row.authorId) ?? null) : null;
    }

    if (include.photos) {
      enriched.photos = photosByPost.get(row.id) ?? [];
    }

    if (include._count) {
      enriched._count = {
        comments: commentCounts.get(row.id) ?? 0,
        likes: likeCounts.get(row.id) ?? 0,
      };
    }

    return enriched;
  });
}

async function attachEventIncludes(rows: AnyRecord[], include?: AnyRecord): Promise<AnyRecord[]> {
  if (!include?.createdBy || rows.length === 0) {
    return rows;
  }

  const creatorIds = rows.map((row) => row.createdById as string).filter(Boolean);
  const creatorMap = await fetchUsersByIds(creatorIds, include.createdBy.select);

  return rows.map((row) => ({
    ...row,
    createdBy: row.createdById ? (creatorMap.get(row.createdById) ?? null) : null,
  }));
}

async function attachPhotoIncludes(rows: AnyRecord[], include?: AnyRecord): Promise<AnyRecord[]> {
  if (rows.length === 0 || !include) {
    return rows;
  }

  const uploaderMap = include.uploader
    ? await fetchUsersByIds(
        rows.map((row) => row.uploaderId as string).filter(Boolean),
        include.uploader.select
      )
    : new Map<string, AnyRecord>();

  const postMap = include.post
    ? await fetchPostsByIds(
        rows.map((row) => row.postId as string).filter(Boolean),
        include.post.select
      )
    : new Map<string, AnyRecord>();

  return rows.map((row) => {
    const enriched = { ...row };

    if (include.uploader) {
      enriched.uploader = row.uploaderId ? (uploaderMap.get(row.uploaderId) ?? null) : null;
    }
    if (include.post) {
      enriched.post = row.postId ? (postMap.get(row.postId) ?? null) : null;
    }

    return enriched;
  });
}

async function attachVideoIncludes(rows: AnyRecord[], include?: AnyRecord): Promise<AnyRecord[]> {
  if (rows.length === 0 || !include) {
    return rows;
  }

  const uploaderMap = include.uploader
    ? await fetchUsersByIds(
        rows.map((row) => row.uploaderId as string).filter(Boolean),
        include.uploader.select
      )
    : new Map<string, AnyRecord>();

  const postMap = include.post
    ? await fetchPostsByIds(
        rows.map((row) => row.postId as string).filter(Boolean),
        include.post.select
      )
    : new Map<string, AnyRecord>();

  return rows.map((row) => {
    const enriched = { ...row };

    if (include.uploader) {
      enriched.uploader = row.uploaderId ? (uploaderMap.get(row.uploaderId) ?? null) : null;
    }
    if (include.post) {
      enriched.post = row.postId ? (postMap.get(row.postId) ?? null) : null;
    }

    return enriched;
  });
}

const postModel = {
  async create(options: AnyRecord) {
    const { data, error } = await getSupabaseAdmin()
      .from('Post')
      .insert(cleanData(options?.data ?? {}))
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }

    if (!options?.include) {
      return data;
    }

    return (await attachPostIncludes([data], options.include))[0];
  },

  async findMany(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Post').select('*');
    query = applyWhere(query, options.where);
    query = applyOrder(query, options.orderBy);
    query = applyPagination(query, options.take, options.skip);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }

    return attachPostIncludes(data ?? [], options.include);
  },

  async findUnique(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Post').select('*');
    query = applyWhere(query, options.where);
    const { data, error } = await query.limit(1).maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch post: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    if (!options.include) {
      return data;
    }

    return (await attachPostIncludes([data], options.include))[0];
  },

  async update(options: AnyRecord = {}) {
    let query = getSupabaseAdmin()
      .from('Post')
      .update(cleanData(options.data ?? {}))
      .select('*');
    query = applyWhere(query, options.where);

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`Failed to update post: ${error.message}`);
    }

    if (!data) {
      throw new Error('Post not found');
    }

    if (!options.include) {
      return data;
    }

    return (await attachPostIncludes([data], options.include))[0];
  },

  async delete(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Post').delete().select('*');
    query = applyWhere(query, options.where);

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }

    return data;
  },

  async count(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Post').select('id', { head: true, count: 'exact' });
    query = applyWhere(query, options.where);

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count posts: ${error.message}`);
    }

    return count ?? 0;
  },
};

const eventModel = {
  async create(options: AnyRecord = {}) {
    const { data, error } = await getSupabaseAdmin()
      .from('Event')
      .insert(cleanData(options.data ?? {}))
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }

    if (!options.include) {
      return data;
    }

    return (await attachEventIncludes([data], options.include))[0];
  },

  async findMany(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Event').select('*');
    query = applyWhere(query, options.where);
    query = applyOrder(query, options.orderBy);
    query = applyPagination(query, options.take, options.skip);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    return attachEventIncludes(data ?? [], options.include);
  },

  async findUnique(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Event').select('*');
    query = applyWhere(query, options.where);
    const { data, error } = await query.limit(1).maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch event: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    if (!options.include) {
      return data;
    }

    return (await attachEventIncludes([data], options.include))[0];
  },

  async update(options: AnyRecord = {}) {
    let query = getSupabaseAdmin()
      .from('Event')
      .update(cleanData(options.data ?? {}))
      .select('*');
    query = applyWhere(query, options.where);

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`Failed to update event: ${error.message}`);
    }

    if (!data) {
      throw new Error('Event not found');
    }

    if (!options.include) {
      return data;
    }

    return (await attachEventIncludes([data], options.include))[0];
  },

  async delete(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Event').delete().select('*');
    query = applyWhere(query, options.where);

    const { data, error } = await query.maybeSingle();
    if (error) {
      throw new Error(`Failed to delete event: ${error.message}`);
    }

    return data;
  },

  async count(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Event').select('id', { head: true, count: 'exact' });
    query = applyWhere(query, options.where);

    const { count, error } = await query;
    if (error) {
      throw new Error(`Failed to count events: ${error.message}`);
    }

    return count ?? 0;
  },
};

const commentModel = {
  async findMany(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Comment').select('*');
    query = applyWhere(query, options.where);
    query = applyOrder(query, options.orderBy);

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch comments: ${error.message}`);
    }

    const comments = data ?? [];
    if (comments.length === 0 || !options.include) {
      return comments;
    }

    let authorMap = new Map<string, AnyRecord>();
    if (options.include.author) {
      authorMap = await fetchUsersByIds(
        comments.map((comment: any) => comment.authorId as string).filter(Boolean),
        options.include.author.select
      );
    }

    let repliesByParent = new Map<string, AnyRecord[]>();
    if (options.include.replies) {
      const parentIds = comments.map((comment: any) => comment.id as string);
      if (parentIds.length > 0) {
        let replyQuery = getSupabaseAdmin().from('Comment').select('*').in('parentId', parentIds);
        replyQuery = applyOrder(replyQuery, options.include.replies.orderBy);

        const { data: replies, error: repliesError } = await replyQuery;
        if (repliesError) {
          throw new Error(`Failed to fetch replies: ${repliesError.message}`);
        }

        let replyAuthorMap = new Map<string, AnyRecord>();
        if (options.include.replies.include?.author) {
          replyAuthorMap = await fetchUsersByIds(
            (replies ?? []).map((reply: any) => reply.authorId as string).filter(Boolean),
            options.include.replies.include.author.select
          );
        }

        for (const reply of replies ?? []) {
          const parentId = reply.parentId as string;
          const enrichedReply = {
            ...reply,
            ...(options.include.replies.include?.author
              ? {
                  author: reply.authorId
                    ? (replyAuthorMap.get(reply.authorId) ?? null)
                    : null,
                }
              : {}),
          };

          const currentReplies = repliesByParent.get(parentId) ?? [];
          currentReplies.push(enrichedReply);
          repliesByParent.set(parentId, currentReplies);
        }
      }
    }

    return comments.map((comment: any) => ({
      ...comment,
      ...(options.include.author
        ? {
            author: comment.authorId ? (authorMap.get(comment.authorId) ?? null) : null,
          }
        : {}),
      ...(options.include.replies
        ? {
            replies: repliesByParent.get(comment.id) ?? [],
          }
        : {}),
    }));
  },

  async create(options: AnyRecord = {}) {
    const { data, error } = await getSupabaseAdmin()
      .from('Comment')
      .insert(cleanData(options.data ?? {}))
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create comment: ${error.message}`);
    }

    if (!options.include?.author) {
      return data;
    }

    const authors = await fetchUsersByIds(
      [data.authorId].filter(Boolean),
      options.include.author.select
    );

    return {
      ...data,
      author: data.authorId ? (authors.get(data.authorId) ?? null) : null,
    };
  },

  async count(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Comment').select('id', { head: true, count: 'exact' });
    query = applyWhere(query, options.where);

    const { count, error } = await query;
    if (error) {
      throw new Error(`Failed to count comments: ${error.message}`);
    }

    return count ?? 0;
  },
};

const userModel = {
  async upsert(options: AnyRecord = {}) {
    const where = options.where ?? {};
    const uniqueKey = Object.keys(where)[0];

    if (!uniqueKey) {
      throw new Error('User upsert requires a unique where clause');
    }

    let existingQuery = getSupabaseAdmin().from('User').select('*');
    existingQuery = applyWhere(existingQuery, where);
    const { data: existing, error: existingError } = await existingQuery.limit(1).maybeSingle();

    if (existingError) {
      throw new Error(`Failed to lookup user: ${existingError.message}`);
    }

    if (existing) {
      const updateData = cleanData(options.update ?? {});
      if (Object.keys(updateData).length === 0) {
        return existing;
      }

      let updateQuery = getSupabaseAdmin()
        .from('User')
        .update(updateData)
        .select('*');
      updateQuery = applyWhere(updateQuery, where);
      const { data: updated, error: updateError } = await updateQuery.single();

      if (updateError) {
        throw new Error(`Failed to update user: ${updateError.message}`);
      }

      return updated;
    }

    const createData = cleanData({ ...(options.create ?? {}), ...where });
    const { data: created, error: createError } = await getSupabaseAdmin()
      .from('User')
      .insert(createData)
      .select('*')
      .single();

    if (createError) {
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    return created;
  },

  async findUnique(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('User').select('*');
    query = applyWhere(query, options.where);

    const { data, error } = await query.limit(1).maybeSingle();
    if (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  },

  async count(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('User').select('id', { head: true, count: 'exact' });
    query = applyWhere(query, options.where);

    const { count, error } = await query;
    if (error) {
      throw new Error(`Failed to count users: ${error.message}`);
    }

    return count ?? 0;
  },
};

const likeModel = {
  async findUnique(options: AnyRecord = {}) {
    const where = options.where ?? {};
    let query = getSupabaseAdmin().from('Like').select('*');

    if (where.userId_postId) {
      query = query
        .eq('userId', where.userId_postId.userId)
        .eq('postId', where.userId_postId.postId);
    } else if (where.userId_commentId) {
      query = query
        .eq('userId', where.userId_commentId.userId)
        .eq('commentId', where.userId_commentId.commentId);
    } else {
      query = applyWhere(query, where);
    }

    const { data, error } = await query.limit(1).maybeSingle();
    if (error) {
      throw new Error(`Failed to fetch like: ${error.message}`);
    }

    return data;
  },

  async create(options: AnyRecord = {}) {
    const { data, error } = await getSupabaseAdmin()
      .from('Like')
      .insert(cleanData(options.data ?? {}))
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create like: ${error.message}`);
    }

    return data;
  },

  async delete(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Like').delete().select('*');
    query = applyWhere(query, options.where);
    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`Failed to delete like: ${error.message}`);
    }

    return data;
  },

  async count(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Like').select('id', { head: true, count: 'exact' });
    query = applyWhere(query, options.where);

    const { count, error } = await query;
    if (error) {
      throw new Error(`Failed to count likes: ${error.message}`);
    }

    return count ?? 0;
  },
};

const photoModel = {
  async create(options: AnyRecord = {}) {
    const { data, error } = await getSupabaseAdmin()
      .from('Photo')
      .insert(cleanData(options.data ?? {}))
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create photo: ${error.message}`);
    }

    if (!options.include) {
      return data;
    }

    return (await attachPhotoIncludes([data], options.include))[0];
  },

  async findMany(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Photo').select('*');
    query = applyWhere(query, options.where);
    query = applyOrder(query, options.orderBy);
    query = applyPagination(query, options.take, options.skip);

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch photos: ${error.message}`);
    }

    return attachPhotoIncludes(data ?? [], options.include);
  },

  async findUnique(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Photo').select('*');
    query = applyWhere(query, options.where);

    const { data, error } = await query.limit(1).maybeSingle();
    if (error) {
      throw new Error(`Failed to fetch photo: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    if (!options.include) {
      return data;
    }

    return (await attachPhotoIncludes([data], options.include))[0];
  },

  async update(options: AnyRecord = {}) {
    let query = getSupabaseAdmin()
      .from('Photo')
      .update(cleanData(options.data ?? {}))
      .select('*');
    query = applyWhere(query, options.where);

    const { data, error } = await query.maybeSingle();
    if (error) {
      throw new Error(`Failed to update photo: ${error.message}`);
    }

    if (!data) {
      throw new Error('Photo not found');
    }

    if (!options.include) {
      return data;
    }

    return (await attachPhotoIncludes([data], options.include))[0];
  },

  async delete(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Photo').delete().select('*');
    query = applyWhere(query, options.where);

    const { data, error } = await query.maybeSingle();
    if (error) {
      throw new Error(`Failed to delete photo: ${error.message}`);
    }

    return data;
  },

  async count(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Photo').select('id', { head: true, count: 'exact' });
    query = applyWhere(query, options.where);

    const { count, error } = await query;
    if (error) {
      throw new Error(`Failed to count photos: ${error.message}`);
    }

    return count ?? 0;
  },

  async updateMany(options: AnyRecord = {}) {
    let query = getSupabaseAdmin()
      .from('Photo')
      .update(cleanData(options.data ?? {}))
      .select('id');
    query = applyWhere(query, options.where);

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to update many photos: ${error.message}`);
    }

    return { count: (data ?? []).length };
  },
};

const videoModel = {
  async create(options: AnyRecord = {}) {
    const { data, error } = await getSupabaseAdmin()
      .from('Video')
      .insert(cleanData(options.data ?? {}))
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create video: ${error.message}`);
    }

    if (!options.include) {
      return data;
    }

    return (await attachVideoIncludes([data], options.include))[0];
  },

  async findMany(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Video').select('*');
    query = applyWhere(query, options.where);
    query = applyOrder(query, options.orderBy);
    query = applyPagination(query, options.take, options.skip);

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch videos: ${error.message}`);
    }

    return attachVideoIncludes(data ?? [], options.include);
  },

  async findUnique(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Video').select('*');
    query = applyWhere(query, options.where);

    const { data, error } = await query.limit(1).maybeSingle();
    if (error) {
      throw new Error(`Failed to fetch video: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    if (!options.include) {
      return data;
    }

    return (await attachVideoIncludes([data], options.include))[0];
  },

  async update(options: AnyRecord = {}) {
    let query = getSupabaseAdmin()
      .from('Video')
      .update(cleanData(options.data ?? {}))
      .select('*');
    query = applyWhere(query, options.where);

    const { data, error } = await query.maybeSingle();
    if (error) {
      throw new Error(`Failed to update video: ${error.message}`);
    }

    if (!data) {
      throw new Error('Video not found');
    }

    if (!options.include) {
      return data;
    }

    return (await attachVideoIncludes([data], options.include))[0];
  },

  async delete(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Video').delete().select('*');
    query = applyWhere(query, options.where);

    const { data, error } = await query.maybeSingle();
    if (error) {
      throw new Error(`Failed to delete video: ${error.message}`);
    }

    return data;
  },

  async count(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Video').select('id', { head: true, count: 'exact' });
    query = applyWhere(query, options.where);

    const { count, error } = await query;
    if (error) {
      throw new Error(`Failed to count videos: ${error.message}`);
    }

    return count ?? 0;
  },
};

const settingsModel = {
  async create(options: AnyRecord = {}) {
    const { data, error } = await getSupabaseAdmin()
      .from('Settings')
      .insert(cleanData(options.data ?? {}))
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create settings: ${error.message}`);
    }

    return data;
  },

  async findUnique(options: AnyRecord = {}) {
    let query = getSupabaseAdmin().from('Settings').select('*');
    query = applyWhere(query, options.where);

    const { data, error } = await query.limit(1).maybeSingle();
    if (error) {
      throw new Error(`Failed to fetch settings: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    if (!options.select) {
      return data;
    }

    return pickSelected(data, options.select);
  },

  async update(options: AnyRecord = {}) {
    let query = getSupabaseAdmin()
      .from('Settings')
      .update(cleanData(options.data ?? {}))
      .select('*');
    query = applyWhere(query, options.where);

    const { data, error } = await query.single();
    if (error) {
      throw new Error(`Failed to update settings: ${error.message}`);
    }

    return data;
  },

  async upsert(options: AnyRecord = {}) {
    const existing = await settingsModel.findUnique({ where: options.where });
    if (existing) {
      return settingsModel.update({
        where: options.where,
        data: options.update,
      });
    }

    return settingsModel.create({ data: options.create });
  },
};

export const supabaseDb = {
  $connect: async () => {
    // Supabase HTTP client is stateless; this is here for compatibility.
  },

  $disconnect: async () => {
    // Supabase HTTP client is stateless; this is here for compatibility.
  },

  $queryRaw: async (_query: TemplateStringsArray | string, ..._values: any[]) => {
    const { error } = await getSupabaseAdmin()
      .from('Post')
      .select('id', { head: true, count: 'exact' })
      .limit(1);

    if (error) {
      throw new Error(`Failed raw query health check: ${error.message}`);
    }

    return [{ ok: true }];
  },

  post: postModel,
  event: eventModel,
  comment: commentModel,
  user: userModel,
  like: likeModel,
  photo: photoModel,
  video: videoModel,
  settings: settingsModel,
};

// Backwards-compatible alias for any stale imports not yet migrated.
export const prisma = supabaseDb;

export async function connectWithRetry(maxRetries = 5, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await supabaseDb.$connect();
      return;
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
