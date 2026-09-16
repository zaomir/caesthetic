import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import poll


class ReceiptPublisherTest(unittest.TestCase):
    def test_request_materialization_preserves_committed_bytes(self):
        with tempfile.TemporaryDirectory() as d:
            repo=Path(d)
            def git(*args):
                return subprocess.check_output(['git',*args],cwd=repo,stderr=subprocess.DEVNULL)
            git('init','-b','main')
            git('config','user.name','Receipt Test')
            git('config','user.email','receipt@example.test')
            folder=repo/'docs/agent-api/requests'
            folder.mkdir(parents=True)
            values={'without-lf.json':b'{"type":"caesthetic_medspa"}', 'with-space.json':b' {"type":"caesthetic_medspa"} \n\n'}
            for name,value in values.items():
                (folder/name).write_bytes(value)
            git('add','docs');git('commit','-m','requests')
            git('update-ref','refs/remotes/origin/main','HEAD')
            with patch.object(poll,'REPO',repo),patch.object(poll,'REQUESTS',folder):
                poll.materialize_origin_requests()
            for name,value in values.items():
                self.assertEqual((folder/name).read_bytes(),value)
            self.assertEqual(git('status','--porcelain'),b'')

    def test_receipt_push_preserves_application_checkout_and_index(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            remote, repo = root/'remote.git', root/'work'
            def git(*args, cwd=repo):
                return subprocess.check_output(['git', *args], cwd=cwd, stderr=subprocess.DEVNULL, text=True).strip()
            git('init', '--bare', str(remote), cwd=root)
            git('init', '-b', 'main', str(repo), cwd=root)
            git('config','user.name','Receipt Test')
            git('config','user.email','receipt@example.test')
            (repo/'application.txt').write_text('committed')
            git('add','application.txt');git('commit','-m','base')
            git('remote','add','origin',str(remote));git('push','-u','origin','main')
            head = git('rev-parse','HEAD')
            (repo/'application.txt').write_text('local application edit')
            git('add','application.txt')
            (repo/'private.txt').write_text('must never publish')
            path = 'docs/agent-api/results/test.json'
            target = repo/path;target.parent.mkdir(parents=True);target.write_text(json.dumps({'ok':True}))
            with patch.object(poll,'REPO',repo):
                self.assertTrue(poll.commit_push([path], 'receipt'))
                self.assertTrue(poll.commit_push([path], 'same receipt'))
                with self.assertRaises(ValueError):
                    poll.commit_push(['private.txt'], 'rejected')
            self.assertEqual(git('rev-parse','HEAD'), head)
            self.assertEqual(git('show',':application.txt'), 'local application edit')
            git('fetch','origin','main')
            self.assertEqual(git('show','origin/main:application.txt'), 'committed')
            self.assertNotIn('private.txt',git('ls-tree','-r','--name-only','origin/main'))
            self.assertEqual(json.loads(git('show','origin/main:'+path)),{'ok':True})
            # A second, changed heartbeat reproduces the next-tick dirty-file conflict.
            git('reset', '--', 'application.txt')
            with patch.object(poll,'REPO',repo), patch.object(poll,'REQUESTS',repo/'docs/agent-api/requests'):
                poll.reconcile_published_worktree()
                git('merge','--ff-only','origin/main')
                target.write_text(json.dumps({'ok':True,'tick':2}))
                self.assertTrue(poll.commit_push([path], 'next heartbeat'))
                poll.reconcile_published_worktree()
                git('merge','--ff-only','origin/main')
            self.assertEqual(json.loads(target.read_text())['tick'],2)
            self.assertEqual((repo/'application.txt').read_text(),'local application edit')
            self.assertEqual((repo/'private.txt').read_text(),'must never publish')
            # An unpublished receipt and a staged receipt must both be preserved.
            target.write_text('unpublished local receipt')
            with patch.object(poll,'REPO',repo):
                poll.reconcile_published_worktree()
            self.assertEqual(target.read_text(),'unpublished local receipt')
            target.write_text(git('show','origin/main:'+path))
            git('add',path)
            with patch.object(poll,'REPO',repo):
                poll.reconcile_published_worktree()
            self.assertTrue(target.exists())


if __name__ == '__main__':
    unittest.main()
