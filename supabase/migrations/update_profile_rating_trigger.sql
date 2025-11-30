-- Function to update profile rating and review count
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the reviewee's rating and review count
    UPDATE profiles
    SET 
        review_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE reviewee_id = NEW.reviewee_id
        ),
        rating = (
            SELECT AVG(rating)::float
            FROM reviews
            WHERE reviewee_id = NEW.reviewee_id
        )
    WHERE id = NEW.reviewee_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update profile rating on delete (uses OLD instead of NEW)
CREATE OR REPLACE FUNCTION update_profile_rating_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the reviewee's rating and review count
    UPDATE profiles
    SET 
        review_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE reviewee_id = OLD.reviewee_id
        ),
        rating = COALESCE((
            SELECT AVG(rating)::float
            FROM reviews
            WHERE reviewee_id = OLD.reviewee_id
        ), 0)
    WHERE id = OLD.reviewee_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update rating after insert
CREATE TRIGGER update_rating_after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_profile_rating();

-- Trigger to update rating after update
CREATE TRIGGER update_rating_after_review_update
AFTER UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_profile_rating();

-- Trigger to update rating after delete
CREATE TRIGGER update_rating_after_review_delete
AFTER DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_profile_rating_on_delete();

-- One-time update to recalculate all existing ratings
UPDATE profiles p
SET 
    review_count = (
        SELECT COUNT(*)
        FROM reviews r
        WHERE r.reviewee_id = p.id
    ),
    rating = COALESCE((
        SELECT AVG(r.rating)::float
        FROM reviews r
        WHERE r.reviewee_id = p.id
    ), 0);
