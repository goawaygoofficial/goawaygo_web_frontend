import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, ButtonLink, Icon, PageHeader, PageShell } from '@/components';
import { useBack } from '@/hooks';
import { toErrorMessage } from '@/lib/apiClient';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import { Avatar, PersonRow } from '../components/People';
import { PlaceFields } from '../components/PlaceFields';
import { PostCard } from '../components/PostCard';
import { ReportDialog } from '../components/ReportDialog';
import shared from '../components/Wanderbook.module.css';
import { usePaged } from '../hooks/usePaged';
import {
  addComment,
  deleteComment,
  editPost,
  getComments,
  getLikes,
  getPost,
} from '../services/wanderbookService';
import { timeAgo } from '../timeAgo';
import type { Comment, Person, PlaceTag, Post, ReportTarget } from '../types';
import styles from './PostPage.module.css';

/** One post with its comments; its author can edit the caption and place here. */
export function PostPage() {
  const { publicId = '' } = useParams();
  const [search, setSearch] = useSearchParams();
  const goBack = useBack(routes.wanderbook);
  const navigate = useNavigate();
  const { user } = useUser();
  const [loaded, setLoaded] = useState<{
    id: string;
    post: Post | null;
    error: string | null;
  } | null>(null);
  const [reporting, setReporting] = useState<{
    type: ReportTarget;
    id: string;
    label: string;
  } | null>(null);
  const [likers, setLikers] = useState<Person[] | null>(null);
  const comments = usePaged(`comments|${publicId}|${String(user?.id)}`, (cursor, signal) =>
    getComments(publicId, cursor, signal),
  );

  useEffect(() => {
    const controller = new AbortController();
    getPost(publicId, controller.signal)
      .then((post) => {
        setLoaded({ id: publicId, post, error: null });
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted)
          setLoaded({ id: publicId, post: null, error: toErrorMessage(cause) });
      });
    return () => {
      controller.abort();
    };
  }, [publicId, user?.id]);

  const current = loaded?.id === publicId ? loaded : null;
  // The post as the previous page showed it (MorphLink), so its photo is here at once; the fresh copy replaces it.
  const preview = (useLocation().state as { preview?: Post } | null)?.preview;
  const post = current?.post ?? (preview?.publicId === publicId ? preview : null);
  const editing = search.get('edit') === '1' && post?.isYours === true;
  const setPost = (next: Post) => {
    setLoaded({ id: publicId, post: next, error: null });
  };

  return (
    <PageShell>
      <PageHeader onBack={goBack} />
      <div className={styles.column}>
        {!current && !post && <p className={shared.status}>Loading…</p>}
        {current?.error && <p className={shared.status}>{current.error}</p>}
        {post && editing && (
          <EditPost
            post={post}
            onDone={(saved) => {
              if (saved) setPost(saved);
              setSearch({}, { replace: true });
            }}
          />
        )}
        {post && !editing && (
          <>
            <PostCard
              post={post}
              full
              onChange={setPost}
              onDeleted={() => {
                void navigate(routes.wanderbook, { replace: true });
              }}
              onReport={() => {
                setReporting({ type: 'post', id: post.publicId, label: 'this post' });
              }}
            />
            {post.likes > 0 && (
              <button
                type="button"
                className={styles.textButton}
                onClick={() => {
                  if (likers) setLikers(null);
                  else
                    getLikes(post.publicId).then(setLikers, () => {
                      setLikers([]);
                    });
                }}
              >
                {likers ? 'Hide likes' : 'See who liked this'}
              </button>
            )}
            {likers && (
              <ul className={shared.list} aria-label="Liked by">
                {likers.map((person) => (
                  <PersonRow key={person.publicId} person={person} />
                ))}
              </ul>
            )}

            <section className={styles.comments} aria-label="Comments">
              <h2 className={styles.heading}>Comments</h2>
              {comments.items?.length === 0 && <p className={shared.muted}>No comments yet.</p>}
              <ul className={shared.list}>
                {comments.items?.map((comment) => (
                  <CommentRow
                    key={comment.id}
                    comment={comment}
                    onDelete={() => {
                      deleteComment(comment.id).then(
                        () => {
                          comments.update((items) => items.filter((c) => c.id !== comment.id));
                          setPost({ ...post, comments: post.comments - 1 });
                        },
                        (cause: unknown) => {
                          window.alert(toErrorMessage(cause));
                        },
                      );
                    }}
                    onReport={
                      // Others' comments (yours, or any on your post, can simply be deleted).
                      user && !comment.canDelete
                        ? () => {
                            setReporting({
                              type: 'comment',
                              id: String(comment.id),
                              label: 'this comment',
                            });
                          }
                        : undefined
                    }
                  />
                ))}
              </ul>
              {comments.hasMore && (
                <button type="button" className={styles.textButton} onClick={comments.loadMore}>
                  More comments
                </button>
              )}
              {user ? (
                <NewComment
                  postId={post.publicId}
                  onAdded={(comment) => {
                    comments.update((items) => [...items, comment]);
                    setPost({ ...post, comments: post.comments + 1 });
                  }}
                />
              ) : (
                <ButtonLink to={routes.profile} variant="outline" size="sm">
                  Sign in to comment
                </ButtonLink>
              )}
            </section>
          </>
        )}
      </div>
      <ReportDialog
        target={reporting}
        onClose={() => {
          setReporting(null);
        }}
      />
    </PageShell>
  );
}

function CommentRow({
  comment,
  onDelete,
  onReport,
}: {
  comment: Comment;
  onDelete: () => void;
  onReport?: () => void;
}) {
  return (
    <li className={styles.comment}>
      <Link to={routes.wanderbookProfile(comment.author.publicId)} aria-hidden="true" tabIndex={-1}>
        <Avatar url={comment.author.photoUrl} size="2rem" />
      </Link>
      <div className={styles.commentBody}>
        <p>
          <Link
            to={routes.wanderbookProfile(comment.author.publicId)}
            className={shared.personName}
          >
            {comment.author.name}
          </Link>{' '}
          {comment.text}
        </p>
        <p className={shared.muted}>
          {timeAgo(comment.createdAt)}
          {comment.canDelete && (
            <button type="button" className={styles.textButton} onClick={onDelete}>
              Delete
            </button>
          )}
          {onReport && (
            <button type="button" className={styles.textButton} onClick={onReport}>
              Report
            </button>
          )}
        </p>
      </div>
    </li>
  );
}

function NewComment({ postId, onAdded }: { postId: string; onAdded: (comment: Comment) => void }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className={styles.newComment}
      onSubmit={(event) => {
        event.preventDefault();
        setSending(true);
        setError(null);
        addComment(postId, text.trim())
          .then((comment) => {
            onAdded(comment);
            setText('');
          })
          .catch((cause: unknown) => {
            setError(toErrorMessage(cause));
          })
          .finally(() => {
            setSending(false);
          });
      }}
    >
      <label className="visually-hidden" htmlFor="new-comment">
        Add a comment
      </label>
      <input
        id="new-comment"
        maxLength={500}
        placeholder="Add a comment…"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
        }}
      />
      <button
        type="submit"
        className={shared.iconButton}
        aria-label="Post comment"
        disabled={sending || text.trim().length === 0}
      >
        <Icon name="check" />
      </button>
      {error && <p className={shared.error}>{error}</p>}
    </form>
  );
}

function EditPost({ post, onDone }: { post: Post; onDone: (saved: Post | null) => void }) {
  const [caption, setCaption] = useState(post.caption);
  const [place, setPlace] = useState<PlaceTag | null>(post.place);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className={styles.edit}
      onSubmit={(event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        editPost(post.publicId, { caption: caption.trim(), place })
          .then(onDone)
          .catch((cause: unknown) => {
            setError(toErrorMessage(cause));
            setSaving(false);
          });
      }}
    >
      <h1 className={styles.heading}>Edit post</h1>
      <label className={shared.field}>
        <span className={shared.fieldLabel}>Caption</span>
        <textarea
          maxLength={2200}
          value={caption}
          onChange={(event) => {
            setCaption(event.target.value);
          }}
        />
      </label>
      <PlaceFields value={place} onChange={setPlace} />
      {error && <p className={shared.error}>{error}</p>}
      <div className={styles.buttons}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            onDone(null);
          }}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
