-- Gallery Database Schema for Supabase
-- Creates posts and comments tables with sample data

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at updates
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample posts data
INSERT INTO posts (image_url, description, tags, created_at) VALUES
(
    '/modern-architecture-building.png',
    '현대적인 건축물의 아름다운 기하학적 패턴과 빛의 조화를 담은 사진입니다. 도시의 새로운 랜드마크가 될 이 건물의 독특한 디자인이 인상적입니다.',
    ARRAY['건축', '현대', '도시', '디자인'],
    NOW() - INTERVAL '2 hours'
),
(
    '/mountain-landscape.png',
    '새벽 안개가 자욱한 산맥의 장엄한 풍경입니다. 자연의 웅장함과 고요함이 동시에 느껴지는 순간을 포착했습니다.',
    ARRAY['자연', '산', '풍경', '안개'],
    NOW() - INTERVAL '5 hours'
),
(
    '/colorful-abstract-art.png',
    '다채로운 색상이 어우러진 추상 예술 작품입니다. 각각의 색깔이 만들어내는 조화로운 패턴이 보는 이의 마음을 편안하게 만듭니다.',
    ARRAY['예술', '추상', '색상', '패턴'],
    NOW() - INTERVAL '8 hours'
),
(
    '/urban-street-scene.png',
    '도시의 활기찬 거리 풍경을 담았습니다. 사람들의 일상과 도시의 에너지가 생생하게 전해지는 한 장면입니다.',
    ARRAY['도시', '거리', '일상', '사람들'],
    NOW() - INTERVAL '12 hours'
),
(
    '/minimalist-interior.png',
    '미니멀한 인테리어 디자인의 정수를 보여주는 공간입니다. 깔끔하고 세련된 디자인이 현대적인 라이프스타일을 반영합니다.',
    ARRAY['인테리어', '미니멀', '디자인', '모던'],
    NOW() - INTERVAL '1 day'
),
(
    '/gourmet-food-photography.png',
    '정성스럽게 플레이팅된 요리의 아름다운 모습입니다. 색감과 구성이 완벽하게 조화를 이루어 보는 것만으로도 맛있어 보입니다.',
    ARRAY['음식', '요리', '플레이팅', '미식'],
    NOW() - INTERVAL '2 days'
);

-- Insert sample comments data
-- Get post IDs for comments (using a more reliable approach)
DO $$
DECLARE
    post_record RECORD;
BEGIN
    -- Add comments for each post
    FOR post_record IN SELECT id, image_url FROM posts ORDER BY created_at DESC LOOP
        
        -- Comments for modern architecture post
        IF post_record.image_url = '/modern-architecture-building.png' THEN
            INSERT INTO comments (post_id, text, created_at) VALUES
            (post_record.id, '정말 멋진 건축물이네요! 어디에 있는 건물인가요?', NOW() - INTERVAL '1 hour 30 minutes'),
            (post_record.id, '기하학적인 패턴이 너무 아름답습니다. 사진도 정말 잘 찍으셨어요.', NOW() - INTERVAL '1 hour');
            
        -- Comments for mountain landscape post
        ELSIF post_record.image_url = '/mountain-landscape.png' THEN
            INSERT INTO comments (post_id, text, created_at) VALUES
            (post_record.id, '새벽 안개가 정말 신비로워 보이네요. 몇 시에 찍으신 건가요?', NOW() - INTERVAL '4 hours 30 minutes'),
            (post_record.id, '자연의 웅장함이 느껴집니다. 힐링되는 사진이에요.', NOW() - INTERVAL '4 hours'),
            (post_record.id, '이런 풍경을 직접 보고 싶어집니다!', NOW() - INTERVAL '3 hours 45 minutes');
            
        -- Comments for abstract art post
        ELSIF post_record.image_url = '/colorful-abstract-art.png' THEN
            INSERT INTO comments (post_id, text, created_at) VALUES
            (post_record.id, '색감이 정말 화려하고 아름다워요!', NOW() - INTERVAL '7 hours 30 minutes'),
            (post_record.id, '추상 예술의 매력을 잘 보여주는 작품이네요.', NOW() - INTERVAL '7 hours');
            
        -- Comments for urban street scene post
        ELSIF post_record.image_url = '/urban-street-scene.png' THEN
            INSERT INTO comments (post_id, text, created_at) VALUES
            (post_record.id, '도시의 활기가 그대로 전해지는 것 같아요.', NOW() - INTERVAL '11 hours 30 minutes'),
            (post_record.id, '일상의 한 순간을 잘 포착하셨네요!', NOW() - INTERVAL '11 hours'),
            (post_record.id, '거리 사진 찍기 정말 어려운데 멋지게 찍으셨어요.', NOW() - INTERVAL '10 hours 30 minutes');
            
        -- Comments for minimalist interior post
        ELSIF post_record.image_url = '/minimalist-interior.png' THEN
            INSERT INTO comments (post_id, text, created_at) VALUES
            (post_record.id, '깔끔하고 세련된 인테리어네요. 어떤 브랜드 가구인가요?', NOW() - INTERVAL '23 hours'),
            (post_record.id, '미니멀 디자인의 정수를 보여주는 공간이에요!', NOW() - INTERVAL '22 hours 30 minutes');
            
        -- Comments for food photography post
        ELSIF post_record.image_url = '/gourmet-food-photography.png' THEN
            INSERT INTO comments (post_id, text, created_at) VALUES
            (post_record.id, '플레이팅이 정말 예술이네요! 어떤 요리인가요?', NOW() - INTERVAL '1 day 23 hours'),
            (post_record.id, '보기만 해도 맛있어 보여요. 레시피 공유해주세요!', NOW() - INTERVAL '1 day 22 hours'),
            (post_record.id, '음식 사진 정말 잘 찍으시네요. 조명이 완벽해요.', NOW() - INTERVAL '1 day 21 hours');
        END IF;
    END LOOP;
END $$;

-- Enable Row Level Security (RLS) for better security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your use case)
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Posts are insertable by everyone" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Posts are updatable by everyone" ON posts FOR UPDATE USING (true);
CREATE POLICY "Posts are deletable by everyone" ON posts FOR DELETE USING (true);

CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Comments are insertable by everyone" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Comments are updatable by everyone" ON comments FOR UPDATE USING (true);
CREATE POLICY "Comments are deletable by everyone" ON comments FOR DELETE USING (true);
