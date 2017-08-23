import gql from 'util/GraphQL';
import { loadFixtures, unloadFixtures } from 'util/fixtures';
import fixtures from '../__fixtures__/GetReplyAndArticle';

describe('GetReplyAndGetArticle', () => {
  beforeAll(() => loadFixtures(fixtures));

  describe('GetArticle', () => {
    it('should get the specified article & associated replies from ID', async () => {
      expect(
        await gql`{
        GetArticle(id: "foo") {
          text
          references { type }
          replyCount
          replyConnections {
            id
            status
            canUpdateStatus
            createdAt
            updatedAt
            reply {
              versions {
                text
                type
                reference
              }
            }
          }
          replyRequestCount
          requestedForReply
        }
      }`({}, { userId: 'fakeUser', from: 'LINE' })
      ).toMatchSnapshot();
    });

    it('should allow filtering replyConnections', async () => {
      expect(
        await gql`{
          GetArticle(id: "foo3") {
            replyConnections { id, status }
            normalReplies: replyConnections(status: NORMAL) { id, status }
            deletedReplies: replyConnections(status: DELETED) { id, status }
          }
        }`({}, { userId: 'fakeUser', from: 'LINE' })
      ).toMatchSnapshot();
    });

    it('relatedArticles should work', async () => {
      // No param
      //
      expect(
        await gql`{
        GetArticle(id: "foo") {
          relatedArticles {
            edges {
              cursor
              node {
                id, text
              }
              score
            }
          }
        }
      }`()
      ).toMatchSnapshot('relatedArticle no-param test');

      // filter
      //
      expect(
        await gql`{
        GetArticle(id: "foo") {
          relatedArticles(filter: {replyCount: {GT: 0}}) {
            edges {
              cursor
              node {
                id, text
              }
              score
            }
          }
        }
      }`()
      ).toMatchSnapshot('relatedArticle filter test');

      // sort
      //
      expect(
        await gql`{
        GetArticle(id: "foo") {
          relatedArticles(orderBy: [{_score: ASC}]) {
            edges {
              cursor
              node {
                id, text
              }
              score
            }
          }
        }
      }`()
      ).toMatchSnapshot('relatedArticle sorting test');
    });
  });

  describe('GetReply', () => {
    it('should get the specified reply & associated articles from ID', async () => {
      expect(
        await gql`{
        GetReply(id: "bar") {
          versions {
            text
            type
            reference
          }
          replyConnections {
            canUpdateStatus
            article {
              text
            }
          }
        }
      }`()
      ).toMatchSnapshot();
    });

    it('should get allow filtering replyConnections', async () => {
      expect(
        await gql`{
        GetReply(id: "bar2") {
          replyConnections { id, status }
          normalReplies: replyConnections(status: NORMAL) { id, status }
          deletedReplies: replyConnections(status: DELETED) { id, status }
        }
      }`()
      ).toMatchSnapshot();
    });
  });

  afterAll(() => unloadFixtures(fixtures));
});
