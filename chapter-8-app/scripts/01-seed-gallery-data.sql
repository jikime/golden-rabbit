-- 갤러리 앱을 위한 임시 데이터 추가
-- 기존 테이블 구조를 활용하여 샘플 게시물과 댓글 데이터 삽입

-- 기존 데이터 정리 (개발 환경에서만 실행)
DELETE FROM comments;
DELETE FROM posts;

-- 샘플 게시물 데이터 삽입
INSERT INTO posts (id, image_url, description, tags, created_at, updated_at) VALUES
(
  gen_random_uuid(),
  '/modern-architecture-building.png',
  '현대적인 건축물의 아름다운 곡선과 기하학적 패턴이 인상적입니다. 자연광이 만들어내는 그림자의 조화가 특히 매력적이네요.',
  ARRAY['건축', '현대', '디자인', '기하학'],
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
),
(
  gen_random_uuid(),
  '/mountain-landscape.png',
  '새벽 안개가 산봉우리를 감싸고 있는 신비로운 풍경입니다. 자연의 웅장함과 고요함이 동시에 느껴지는 순간을 담았습니다.',
  ARRAY['자연', '산', '풍경', '안개'],
  NOW() - INTERVAL '5 hours',
  NOW() - INTERVAL '5 hours'
),
(
  gen_random_uuid(),
  '/colorful-abstract-art.png',
  '다채로운 색상이 어우러진 추상 작품입니다. 각각의 색깔이 서로 다른 감정을 표현하며 조화를 이루고 있어요.',
  ARRAY['예술', '추상', '색상', '감정'],
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
),
(
  gen_random_uuid(),
  '/urban-street-scene.png',
  '도시의 활기찬 거리 풍경을 포착했습니다. 사람들의 일상과 도시의 에너지가 생생하게 담겨있는 사진이에요.',
  ARRAY['도시', '거리', '일상', '사람들'],
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
),
(
  gen_random_uuid(),
  '/minimalist-interior.png',
  '미니멀한 인테리어 디자인의 정수를 보여주는 공간입니다. 깔끔한 선과 절제된 색감이 평온함을 선사합니다.',
  ARRAY['인테리어', '미니멀', '디자인', '공간'],
  NOW() - INTERVAL '1 week',
  NOW() - INTERVAL '1 week'
),
(
  gen_random_uuid(),
  '/gourmet-food-photography.png',
  '정성스럽게 플레이팅된 요리의 아름다움을 담았습니다. 색감과 구성이 마치 예술 작품 같은 느낌을 줍니다.',
  ARRAY['음식', '요리', '플레이팅', '미식'],
  NOW() - INTERVAL '2 weeks',
  NOW() - INTERVAL '2 weeks'
);

-- 샘플 댓글 데이터 삽입
-- 첫 번째 게시물 (현대 건축)에 대한 댓글들
INSERT INTO comments (id, post_id, text, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  p.id,
  '정말 멋진 건축물이네요! 어디서 촬영하신 건가요?',
  NOW() - INTERVAL '1 hour 30 minutes',
  NOW() - INTERVAL '1 hour 30 minutes'
FROM posts p WHERE p.description LIKE '%현대적인 건축물%';

INSERT INTO comments (id, post_id, text, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  p.id,
  '빛과 그림자의 조화가 정말 아름답습니다.',
  NOW() - INTERVAL '45 minutes',
  NOW() - INTERVAL '45 minutes'
FROM posts p WHERE p.description LIKE '%현대적인 건축물%';

-- 두 번째 게시물 (산 풍경)에 대한 댓글들
INSERT INTO comments (id, post_id, text, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  p.id,
  '새벽 산행의 매력을 잘 보여주는 사진이에요!',
  NOW() - INTERVAL '4 hours',
  NOW() - INTERVAL '4 hours'
FROM posts p WHERE p.description LIKE '%새벽 안개%';

INSERT INTO comments (id, post_id, text, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  p.id,
  '안개 낀 산의 모습이 정말 신비로워요.',
  NOW() - INTERVAL '3 hours 20 minutes',
  NOW() - INTERVAL '3 hours 20 minutes'
FROM posts p WHERE p.description LIKE '%새벽 안개%';

INSERT INTO comments (id, post_id, text, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  p.id,
  '이런 풍경을 직접 보고 싶네요. 위치 정보 공유해주실 수 있나요?',
  NOW() - INTERVAL '2 hours 10 minutes',
  NOW() - INTERVAL '2 hours 10 minutes'
FROM posts p WHERE p.description LIKE '%새벽 안개%';

-- 세 번째 게시물 (추상 예술)에 대한 댓글들
INSERT INTO comments (id, post_id, text, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  p.id,
  '색감이 정말 독특하고 매력적이에요!',
  NOW() - INTERVAL '20 hours',
  NOW() - INTERVAL '20 hours'
FROM posts p WHERE p.description LIKE '%다채로운 색상%';

-- 네 번째 게시물 (도시 거리)에 대한 댓글들
INSERT INTO comments (id, post_id, text, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  p.id,
  '도시의 생동감이 그대로 전해지는 것 같아요.',
  NOW() - INTERVAL '2 days 5 hours',
  NOW() - INTERVAL '2 days 5 hours'
FROM posts p WHERE p.description LIKE '%도시의 활기찬%';

INSERT INTO comments (id, post_id, text, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  p.id,
  '스트리트 포토그래피의 좋은 예시네요!',
  NOW() - INTERVAL '2 days 2 hours',
  NOW() - INTERVAL '2 days 2 hours'
FROM posts p WHERE p.description LIKE '%도시의 활기찬%';

-- 다�섯 번째 게시물 (미니멀 인테리어)에 대한 댓글들
INSERT INTO comments (id, post_id, text, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  p.id,
  '이런 깔끔한 공간에서 살고 싶어요.',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
FROM posts p WHERE p.description LIKE '%미니멀한 인테리어%';

-- 여섯 번째 게시물 (음식 사진)에 대한 댓글들
INSERT INTO comments (id, post_id, text, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  p.id,
  '플레이팅이 정말 예술적이네요! 어떤 요리인가요?',
  NOW() - INTERVAL '1 week 3 days',
  NOW() - INTERVAL '1 week 3 days'
FROM posts p WHERE p.description LIKE '%정성스럽게 플레이팅%';

INSERT INTO comments (id, post_id, text, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  p.id,
  '보기만 해도 맛있어 보여요!',
  NOW() - INTERVAL '1 week 2 days',
  NOW() - INTERVAL '1 week 2 days'
FROM posts p WHERE p.description LIKE '%정성스럽게 플레이팅%';
