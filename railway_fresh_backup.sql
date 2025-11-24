-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: switchyard.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `answer_votes`
--

DROP TABLE IF EXISTS `answer_votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `answer_votes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `answer_id` int NOT NULL,
  `user_id` int NOT NULL,
  `vote_type` enum('upvote','downvote') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_answer_vote` (`answer_id`,`user_id`),
  KEY `idx_answer_votes_answer` (`answer_id`),
  KEY `idx_answer_votes_user` (`user_id`),
  CONSTRAINT `answer_votes_ibfk_1` FOREIGN KEY (`answer_id`) REFERENCES `answers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `answer_votes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answer_votes`
--

LOCK TABLES `answer_votes` WRITE;
/*!40000 ALTER TABLE `answer_votes` DISABLE KEYS */;
/*!40000 ALTER TABLE `answer_votes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `answers`
--

DROP TABLE IF EXISTS `answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `user_id` int NOT NULL,
  `content` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `images` text,
  `votes` int DEFAULT '0',
  `is_accepted` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `answers_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `answers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answers`
--

LOCK TABLES `answers` WRITE;
/*!40000 ALTER TABLE `answers` DISABLE KEYS */;
INSERT INTO `answers` VALUES (1,2,1,'do not cut off the big leaves',NULL,NULL,1,0,'2025-10-23 18:58:09','2025-10-23 22:19:16'),(2,1,2,'Cover it with a basket',NULL,NULL,0,0,'2025-10-26 13:17:30','2025-10-26 13:17:30'),(3,2,4,'Let It grow and water it',NULL,NULL,1,0,'2025-10-26 13:20:27','2025-10-28 16:46:43'),(4,3,1,'Barricate your farm',NULL,NULL,0,0,'2025-10-26 17:33:39','2025-10-26 17:33:39'),(5,1,4,'You can use a scarecrow',NULL,NULL,0,0,'2025-10-26 17:40:56','2025-10-26 17:40:56'),(6,5,4,'Start with fertilizers and seeds ',NULL,NULL,0,0,'2025-10-26 18:03:38','2025-10-26 18:03:38'),(7,2,1,'I hope the cabbage are well ',NULL,NULL,0,0,'2025-10-28 16:46:21','2025-10-28 16:46:21'),(8,12,16,'You can reach out to an extension officer',NULL,NULL,0,0,'2025-11-16 14:16:53','2025-11-16 14:16:53'),(10,13,21,'Yes',NULL,NULL,0,0,'2025-11-21 17:55:34','2025-11-21 17:55:34');
/*!40000 ALTER TABLE `answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blocked_users`
--

DROP TABLE IF EXISTS `blocked_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blocked_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `blocker_id` int NOT NULL COMMENT 'User who blocked',
  `blocked_id` int NOT NULL COMMENT 'User who is blocked',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_block` (`blocker_id`,`blocked_id`),
  KEY `idx_blocker` (`blocker_id`),
  KEY `idx_blocked` (`blocked_id`),
  CONSTRAINT `blocked_users_ibfk_1` FOREIGN KEY (`blocker_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `blocked_users_ibfk_2` FOREIGN KEY (`blocked_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blocked_users`
--

LOCK TABLES `blocked_users` WRITE;
/*!40000 ALTER TABLE `blocked_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `blocked_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `farmer_id` int NOT NULL,
  `officer_id` int DEFAULT NULL COMMENT 'Assigned officer, NULL if not yet assigned',
  `booking_date` date NOT NULL,
  `booking_time` time NOT NULL,
  `purpose` text NOT NULL COMMENT 'Reason for consultation',
  `status` enum('Pending','Confirmed','Declined','Completed','Cancelled') DEFAULT 'Pending',
  `location` varchar(255) DEFAULT NULL COMMENT 'Meeting location',
  `farmer_notes` text COMMENT 'Additional info from farmer',
  `officer_notes` text COMMENT 'Notes from officer',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_farmer_bookings` (`farmer_id`),
  KEY `idx_officer_bookings` (`officer_id`),
  KEY `idx_booking_status` (`status`),
  KEY `idx_booking_date` (`booking_date`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`officer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,1,NULL,'2025-10-28','01:22:00','Crop identification','Cancelled',NULL,NULL,NULL,'2025-10-27 23:21:12','2025-10-27 23:22:16'),(2,1,3,'2025-10-28','01:55:00','Crop pest','Confirmed',NULL,NULL,NULL,'2025-10-27 23:53:28','2025-10-27 23:57:15'),(3,16,17,'2025-11-17','16:21:00','Animal ferterlizer','Confirmed',NULL,NULL,'lets make it by 6pm','2025-11-16 14:21:45','2025-11-16 14:24:16'),(5,21,22,'2025-11-22','20:00:00','What to farm','Confirmed',NULL,NULL,NULL,'2025-11-21 17:52:56','2025-11-21 17:59:34');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user1_id` int NOT NULL,
  `user2_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversations_user1` (`user1_id`),
  KEY `idx_conversations_user2` (`user2_id`),
  KEY `idx_conversations_users` (`user1_id`,`user2_id`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`user1_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`user2_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,1,7,'2025-10-30 08:16:27','2025-10-30 08:16:27'),(2,1,5,'2025-10-30 08:23:13','2025-11-08 21:06:26'),(3,7,10,'2025-11-09 12:39:54','2025-11-09 12:39:59'),(4,14,16,'2025-11-16 14:19:54','2025-11-16 14:19:54'),(5,16,17,'2025-11-16 14:25:37','2025-11-16 14:26:36');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crop_requests`
--

DROP TABLE IF EXISTS `crop_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crop_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `farmer_id` int NOT NULL,
  `location` varchar(255) NOT NULL,
  `soil_type` enum('Sandy','Clay','Loam','Silt','Peat','Chalk','Not Sure') DEFAULT 'Not Sure',
  `season` enum('Dry Season','Rainy Season','All Year') DEFAULT 'Rainy Season',
  `land_size` decimal(10,2) NOT NULL,
  `land_size_unit` enum('Hectares','Acres','Square Meters') DEFAULT 'Hectares',
  `previous_crops` text,
  `challenges` text NOT NULL,
  `additional_info` text,
  `images` text,
  `status` enum('pending','reviewed','responded') DEFAULT 'pending',
  `officer_id` int DEFAULT NULL,
  `officer_notes` text,
  `responded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `farmer_id` (`farmer_id`),
  KEY `officer_id` (`officer_id`),
  CONSTRAINT `crop_requests_ibfk_1` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `crop_requests_ibfk_2` FOREIGN KEY (`officer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crop_requests`
--

LOCK TABLES `crop_requests` WRITE;
/*!40000 ALTER TABLE `crop_requests` DISABLE KEYS */;
INSERT INTO `crop_requests` VALUES (1,2,'Plateau State','Loam','Rainy Season',1.00,'Hectares','Maize','Birds pest','',NULL,'pending',NULL,NULL,NULL,'2025-10-25 16:04:22','2025-10-25 16:04:22'),(2,1,'Bauchi State','Loam','Rainy Season',1.00,'Hectares','Maize','Locust issue','','[\"http://localhost:5000/uploads/crop-requests/requests-1762781784960-469855341.jpeg\"]','responded',4,'','2025-11-10 18:28:53','2025-11-10 13:36:24','2025-11-10 18:28:53'),(3,13,'FCT Abuja','Not Sure','Rainy Season',40.00,'Square Meters','Mango, soursop, Apple,strawberries, indian thyme and curry','Mango not producing, fruites,\nThe soursoap, strawberries curry and thyme spontaneously died, woth adequate water and fertiliser provided ','','[]','pending',NULL,NULL,NULL,'2025-11-15 18:34:53','2025-11-15 18:34:53'),(4,16,'Jigawa State','Not Sure','Dry Season',1.00,'Hectares','Rice','how to farm rice in november','','[]','responded',17,'','2025-11-16 14:25:25','2025-11-16 14:22:48','2025-11-16 14:25:25'),(6,21,'Adamawa State','Loam','Rainy Season',1.00,'Hectares','','i Do not know what to farm','','[]','pending',NULL,NULL,NULL,'2025-11-21 17:53:38','2025-11-21 17:53:38');
/*!40000 ALTER TABLE `crop_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crops`
--

DROP TABLE IF EXISTS `crops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `scientific_name` varchar(100) DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  `season` varchar(50) NOT NULL,
  `climate_type` varchar(100) DEFAULT NULL,
  `soil_type` varchar(100) DEFAULT NULL,
  `water_requirement` varchar(50) DEFAULT NULL,
  `planting_time` varchar(100) DEFAULT NULL,
  `growing_duration` int DEFAULT NULL,
  `harvest_season` varchar(100) DEFAULT NULL,
  `spacing` varchar(100) DEFAULT NULL,
  `common_pests` text,
  `pest_control` text,
  `average_yield` varchar(100) DEFAULT NULL,
  `market_value` varchar(100) DEFAULT NULL,
  `description` text NOT NULL,
  `growing_tips` text,
  `image_url` varchar(255) DEFAULT NULL,
  `suitable_for_region` varchar(100) DEFAULT NULL,
  `difficulty_level` varchar(50) DEFAULT 'Medium',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crops`
--

LOCK TABLES `crops` WRITE;
/*!40000 ALTER TABLE `crops` DISABLE KEYS */;
INSERT INTO `crops` VALUES (1,'Maize','Zea mays','Cereals','Wet Season','Tropical','Loamy soil','Medium','May-July',90,'August-October','75cm x 25cm','Fall armyworm, stem borers','Early planting, use of resistant varieties, chemical control','2-4 tons/hectare','?150,000-?200,000 per ton','Staple cereal crop widely grown across Nigeria. Drought tolerant after establishment.','Plant early to avoid pest infestation. Use certified seeds for better yield.','https://images.unsplash.com/photo-1603176220806-bd6d9db4667f?w=400','Kano State','Easy','2025-11-07 22:41:06','2025-11-10 08:40:18'),(2,'Rice (Upland)','Oryza sativa','Cereals','Wet Season','Tropical','Clay-loam','High','June-August',120,'September-November','20cm x 20cm','Rice blast, stem borers','Water management, resistant varieties','2-3 tons/hectare','?200,000-?250,000 per ton','Important staple crop. Upland rice suitable for rainfed agriculture.','Ensure adequate water supply during flowering stage. Practice proper spacing.',NULL,'Kano State','Medium','2025-11-07 22:41:06','2025-11-07 22:41:06'),(3,'Sorghum','Sorghum bicolor','Cereals','Wet Season','Tropical','Sandy-loam','Low','May-July',100,'September-October','75cm x 15cm','Shootfly, stem borers','Crop rotation, early planting','1.5-3 tons/hectare','?100,000-?150,000 per ton','Drought-resistant cereal crop excellent for semi-arid regions.','Very suitable for areas with limited rainfall. Requires minimal fertilizer.','https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400','Kano State','Easy','2025-11-07 22:41:06','2025-11-10 08:40:21'),(4,'Millet','Pennisetum glaucum','Cereals','Wet Season','Tropical','Sandy soil','Low','June-July',75,'September-October','50cm x 50cm','Shootfly, birds','Early planting, bird scaring','1-2 tons/hectare','?120,000-?180,000 per ton','Hardy cereal that thrives in poor soils. Highly nutritious grain.','Excellent for marginal lands. Matures quickly compared to other cereals.','https://images.unsplash.com/photo-1595400762358-2af7e0c6e5ee?w=400','Kano State','Easy','2025-11-07 22:41:06','2025-11-10 08:47:46'),(5,'Tomatoes','Solanum lycopersicum','Vegetables','Dry Season','Tropical','Well-drained loamy','High','November-January',75,'February-April','60cm x 40cm','Whiteflies, fruit borers, blight','Regular spraying, good drainage, mulching','20-30 tons/hectare','?80,000-?150,000 per ton','High-value vegetable crop. Best grown in dry season with irrigation.','Requires staking. Regular watering is essential. Practice crop rotation.','https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400','Kano State','Medium','2025-11-07 22:41:06','2025-11-10 08:40:18'),(6,'Onions','Allium cepa','Vegetables','Dry Season','Tropical','Sandy-loam','Medium','November-December',90,'February-March','15cm x 10cm','Thrips, purple blotch','Crop rotation, chemical control','15-25 tons/hectare','?100,000-?200,000 per ton','Major cash crop in Northern Nigeria. Requires cool dry conditions.','Plant on ridges for good drainage. Harvest when tops fall over naturally.','https://images.unsplash.com/photo-1587049352846-4a222e784210?w=400','Kano State','Medium','2025-11-07 22:41:06','2025-11-10 08:47:46'),(7,'Pepper','Capsicum annuum','Vegetables','Wet Season','Tropical','Rich loamy soil','Medium','March-May',90,'June-September','50cm x 50cm','Aphids, fruit flies','Mulching, use of neem extracts','5-10 tons/hectare','?150,000-?300,000 per ton','High-demand vegetable with good market value.','Requires organic matter. Mulch to conserve moisture.','https://images.unsplash.com/photo-1583240197523-d6f6aae4b300?w=400','Kano State','Medium','2025-11-07 22:41:06','2025-11-10 08:47:46'),(8,'Cowpea','Vigna unguiculata','Legumes','Wet Season','Tropical','Sandy-loam','Low','June-July',60,'August-September','60cm x 20cm','Aphids, pod borers','Early planting, resistant varieties','800-1500 kg/hectare','?200,000-?300,000 per ton','Important protein source. Improves soil fertility through nitrogen fixation.','Can be intercropped with cereals. Drought resistant after establishment.','https://images.unsplash.com/photo-1589927986089-35812378d1b9?w=400','Kano State','Easy','2025-11-07 22:41:06','2025-11-10 08:40:18'),(9,'Groundnut','Arachis hypogaea','Legumes','Wet Season','Tropical','Light sandy soil','Medium','May-June',120,'September-October','50cm x 20cm','Leaf miners, aphids, rosette disease','Crop rotation, certified seeds','1-2 tons/hectare','?250,000-?400,000 per ton','Major cash crop. Both nuts and oil have high market value.','Requires calcium. Apply gypsum during flowering. Avoid waterlogged soils.','https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400','Kano State','Medium','2025-11-07 22:41:06','2025-11-10 08:47:46'),(10,'Soybean','Glycine max','Legumes','Wet Season','Tropical','Well-drained loam','Medium','May-July',100,'September-October','50cm x 5cm','Pod borers, rust','Use of improved varieties, proper spacing','1.5-2.5 tons/hectare','?180,000-?250,000 per ton','High protein crop with growing demand. Good for rotation.','Inoculate seeds with rhizobium. Requires good drainage.',NULL,'Kano State','Medium','2025-11-07 22:41:06','2025-11-07 22:41:06'),(11,'Cotton','Gossypium hirsutum','Cash Crops','Wet Season','Tropical','Deep loamy soil','Medium','May-June',150,'October-December','90cm x 30cm','Bollworms, aphids','IPM practices, resistant varieties','1.5-2.5 tons/hectare','?200,000-?300,000 per ton','Important industrial crop. Fiber and seed both have commercial value.','Requires adequate moisture during vegetative growth. Long growing season.',NULL,'Kano State','Hard','2025-11-07 22:41:06','2025-11-07 22:41:06'),(12,'Sugarcane','Saccharum officinarum','Cash Crops','All Year','Tropical','Deep fertile loam','High','Any time with irrigation',365,'After 12 months','90cm x 60cm','Borers, termites','Field sanitation, resistant varieties','40-60 tons/hectare','?15,000-?25,000 per ton','Perennial crop. Requires irrigation in dry season. High water demand.','Ratoon crop gives 2-3 harvests. Requires heavy fertilization.','https://images.unsplash.com/photo-1569870374924-5b28a139c506?w=400','Kano State','Hard','2025-11-07 22:41:06','2025-11-10 08:47:47'),(13,'Maize','Zea mays','Cereals','Wet Season','Tropical','Loamy soil','Medium','May-July',90,'August-October','75cm x 25cm','Fall armyworm, Stem borers','Use neem extract or approved pesticides','2-4 tons/ha','?150,000-?200,000/ton','Maize is a staple cereal crop widely grown across Nigeria. It requires moderate rainfall and well-drained soil.','Plant early in the season to avoid pest infestation. Apply fertilizer at 2 and 6 weeks after planting.','https://images.unsplash.com/photo-1603176220806-bd6d9db4667f?w=400','All regions','Easy','2025-11-09 11:14:23','2025-11-10 08:40:18'),(14,'Rice','Oryza sativa','Cereals','Wet Season','Tropical','Clay loam','High','May-August',120,'September-December','20cm x 20cm','Rice blast, Stem borers','Field sanitation and use of resistant varieties','3-5 tons/ha','?180,000-?250,000/ton','Rice is a major food crop in Nigeria. Requires flooded or well-irrigated fields.','Maintain standing water during vegetative growth. Control weeds early.','https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400','Northern states, Delta','Medium','2025-11-09 11:14:23','2025-11-10 08:40:18'),(15,'Cassava','Manihot esculenta','Cash Crops','All Year','Tropical','Sandy loam','Low','Any time',365,'Year-round','1m x 1m','Cassava mosaic disease, Mealybugs','Use disease-free stems, practice crop rotation','15-25 tons/ha','?30,000-?50,000/ton','Cassava is a drought-resistant root crop and major source of carbohydrates in Nigeria.','Plant disease-free stems. Weed regularly in first 3 months. Harvest after 8-12 months.','https://images.unsplash.com/photo-1580509774891-4ea7a6e5cb40?w=400','All regions','Easy','2025-11-09 11:14:23','2025-11-10 08:40:18'),(16,'Tomato','Solanum lycopersicum','Vegetables','Dry Season','Tropical','Well-drained loam','Medium','November-January',75,'February-April','60cm x 45cm','Whiteflies, Fruit worms','Use sticky traps and biological control','20-30 tons/ha','?80,000-?150,000/ton','Tomato is a high-value vegetable crop. Requires cool dry weather during fruiting.','Stake plants for support. Apply mulch to conserve moisture. Harvest when fruits are firm and red.','https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400','Northern states','Medium','2025-11-09 11:14:23','2025-11-10 08:40:18'),(17,'Cowpea','Vigna unguiculata','Legumes','Wet Season','Tropical','Sandy loam','Low-Medium','June-August',65,'August-October','60cm x 20cm','Pod borers, Aphids','Early planting and use of approved insecticides','1-1.5 tons/ha','?200,000-?300,000/ton','Cowpea is a drought-tolerant legume that fixes nitrogen and improves soil fertility.','Plant at the beginning of rains. Minimal fertilizer needed. Good for intercropping.','https://images.unsplash.com/photo-1589927986089-35812378d1b9?w=400','Northern Nigeria','Easy','2025-11-09 11:14:23','2025-11-10 08:40:18'),(18,'Yam','Dioscorea species','Cash Crops','Wet Season','Tropical','Loose friable soil','Medium','April-June',240,'November-January','1m x 1m','Yam beetles, Nematodes','Use clean seed yams and practice crop rotation','10-20 tons/ha','?100,000-?200,000/ton','Yam is a major food security crop requiring well-structured soil for tuber development.','Stake plants for proper growth. Make ridges or mounds. Harvest when leaves yellow.','https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400','Middle Belt, Southern Nigeria','Medium','2025-11-09 11:14:23','2025-11-10 08:47:46'),(19,'Sorghum','Sorghum bicolor','Cereals','Wet Season','Semi-arid','Sandy loam','Low','May-July',100,'September-November','75cm x 20cm','Grain mold, Stem borers','Use resistant varieties and proper field drainage','1.5-3 tons/ha','?100,000-?150,000/ton','Sorghum is a drought-tolerant cereal suitable for semi-arid regions.','Very tolerant to drought. Good for areas with low rainfall. Harvest when grains are hard.','https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400','Northern Nigeria','Easy','2025-11-09 11:14:23','2025-11-10 08:40:21'),(20,'Pepper (Chili)','Capsicum species','Vegetables','Dry Season','Tropical','Rich loam','Medium','October-December',90,'January-March','50cm x 50cm','Aphids, Whiteflies','Use neem oil and remove infected plants','5-8 tons/ha','?150,000-?300,000/ton','Hot pepper is a high-value spice crop widely consumed in Nigeria.','Requires full sun. Avoid waterlogging. Harvest when fruits turn red for maximum pungency.','https://images.unsplash.com/photo-1583240197523-d6f6aae4b300?w=400','All regions','Medium','2025-11-09 11:14:23','2025-11-10 08:47:46'),(21,'Groundnut','Arachis hypogaea','Legumes','Wet Season','Tropical','Sandy loam','Low-Medium','May-June',100,'August-September','50cm x 20cm','Leaf spot, Aphids','Use certified seeds and fungicide treatment','1.5-2.5 tons/ha','?250,000-?350,000/ton','Groundnut is an oilseed legume that enriches soil with nitrogen.','Plant at onset of rains. Requires calcium for pod formation. Harvest when leaves turn yellow.','https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400','Northern Nigeria','Easy','2025-11-09 11:14:23','2025-11-10 08:47:46'),(22,'Okra','Abelmoschus esculentus','Vegetables','All Year','Tropical','Well-drained loam','Medium','Year-round',60,'Year-round','60cm x 30cm','Fruit borers, Aphids','Hand-pick pests and use neem extract','8-12 tons/ha','?80,000-?120,000/ton','Okra is a fast-growing vegetable popular in Nigerian cuisine.','Harvest pods every 2-3 days when young and tender. Plant in well-drained soil.','https://images.unsplash.com/photo-1631810566370-28a51b7f5afd?w=400','All regions','Easy','2025-11-09 11:14:23','2025-11-10 08:47:46'),(23,'Millet','Pennisetum glaucum','Cereals','Wet Season','Semi-arid','Sandy soil','Low','June-July',75,'September-October','50cm x 30cm','Head miner, Birds','Use bird scarers and early planting','1-2 tons/ha','?120,000-?180,000/ton','Millet is a nutritious cereal grain highly drought-tolerant.','Excellent for dry areas. Very early maturing. Protect from birds during grain filling.','https://images.unsplash.com/photo-1595400762358-2af7e0c6e5ee?w=400','Far North, Sahel','Easy','2025-11-09 11:14:23','2025-11-10 08:47:46'),(24,'Banana','Musa species','Fruits','All Year','Tropical','Rich loam','High','Year-round',365,'Year-round','3m x 3m','Black sigatoka, Weevils','Remove infected leaves, use clean planting material','30-50 tons/ha','?50,000-?80,000/ton','Banana is a perennial fruit crop requiring high moisture and rich soil.','Requires regular irrigation. Mulch heavily. Remove suckers to maintain plant vigor.','https://images.unsplash.com/photo-1603833797131-3c0a0e5b0f4b?w=400','Southern Nigeria, Middle Belt','Medium','2025-11-09 11:14:23','2025-11-10 08:47:46');
/*!40000 ALTER TABLE `crops` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discussion_groups`
--

DROP TABLE IF EXISTS `discussion_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discussion_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `description` text,
  `icon` varchar(10) DEFAULT '?',
  `topic` varchar(100) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_groups_topic` (`topic`),
  KEY `idx_groups_location` (`location`),
  KEY `idx_groups_created_by` (`created_by`),
  CONSTRAINT `discussion_groups_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discussion_groups`
--

LOCK TABLES `discussion_groups` WRITE;
/*!40000 ALTER TABLE `discussion_groups` DISABLE KEYS */;
INSERT INTO `discussion_groups` VALUES (1,'Pest Control Tips & Solutions','Share and learn about effective pest control methods for various crops','?','Pest Control','All States',7,'2025-11-01 13:50:28','2025-11-01 13:50:28'),(2,'Rice Farming Best Practices','Discussion about rice cultivation, from planting to harvest','?','Crop Management','Kano State',7,'2025-11-01 13:50:28','2025-11-01 13:50:28'),(3,'Irrigation Methods & Tips','Learn about modern irrigation techniques and water management','?','Irrigation','Kaduna State',7,'2025-11-01 13:50:28','2025-11-01 13:50:28'),(4,'Organic Fertilizer Guide','Natural and organic fertilizer options for sustainable farming','?','Fertilizers','All States',7,'2025-11-01 13:50:28','2025-11-01 13:50:28'),(5,'Market Prices & Trading','Discuss current market prices and trading opportunities','?','Market Information','Katsina State',7,'2025-11-01 13:50:28','2025-11-01 13:50:28'),(6,'Weather Updates & Farming','Weather forecasts and their impact on farming activities','??','Weather','All States',7,'2025-11-01 13:50:28','2025-11-01 13:50:28'),(7,'Maize Cultivation Community','Everything about growing healthy maize crops','?','Crop Management','Sokoto State',7,'2025-11-01 13:50:28','2025-11-01 13:50:28'),(8,'Soil Health & Management','Improving soil quality for better crop yields','??','Soil Management','Bauchi State',7,'2025-11-01 13:50:28','2025-11-01 13:50:28');
/*!40000 ALTER TABLE `discussion_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_participants`
--

DROP TABLE IF EXISTS `event_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_participants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `user_id` int NOT NULL,
  `status` varchar(50) DEFAULT 'registered',
  `registered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_participant` (`event_id`,`user_id`),
  KEY `idx_event` (`event_id`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `event_participants_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `event_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_participants`
--

LOCK TABLES `event_participants` WRITE;
/*!40000 ALTER TABLE `event_participants` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_registrations`
--

DROP TABLE IF EXISTS `event_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `user_id` int NOT NULL,
  `status` enum('registered','cancelled') DEFAULT 'registered',
  `registered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_registration` (`event_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `event_registrations_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `event_registrations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_registrations`
--

LOCK TABLES `event_registrations` WRITE;
/*!40000 ALTER TABLE `event_registrations` DISABLE KEYS */;
INSERT INTO `event_registrations` VALUES (1,1,1,'cancelled','2025-10-24 08:30:55'),(2,1,3,'registered','2025-10-24 11:36:38'),(3,2,10,'registered','2025-11-09 12:40:42'),(4,1,16,'registered','2025-11-16 14:20:14');
/*!40000 ALTER TABLE `event_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `event_date` date NOT NULL,
  `event_time` time NOT NULL,
  `location` varchar(255) NOT NULL,
  `venue` varchar(255) DEFAULT NULL,
  `event_type` enum('Workshop','Training','Seminar','Networking','Field Day','Other') DEFAULT 'Workshop',
  `max_attendees` int DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL COMMENT 'Officer who created this event',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_event_creator` (`created_by`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `events_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,1,'Modern Farming Tools Workshop','Learn about the latest farming equipment and technology to improve your productivity.','2025-11-20','09:00:00','Katsina State','Katsina Agricultural Center','Workshop',50,NULL,'2025-10-24 08:07:15','2025-10-24 08:07:15',NULL),(2,1,'Organic Pest Control Seminar','Discover natural methods to protect your crops from pests without harmful chemicals.','2025-11-25','14:00:00','Kano State','Kano State University','Seminar',100,NULL,'2025-10-24 08:07:15','2025-10-24 08:07:15',NULL),(3,1,'Farmers Market & Networking','Connect with other farmers, buy and sell produce, and build valuable relationships.','2025-12-02','08:00:00','Kaduna State','Kaduna Trade Center','Networking',200,NULL,'2025-10-24 08:07:15','2025-10-24 08:07:15',NULL),(4,1,'Irrigation Systems Training','Hands-on training on modern irrigation techniques for dry season farming.','2025-12-08','10:00:00','Sokoto State','Sokoto Agric Institute','Training',30,NULL,'2025-10-24 08:07:15','2025-10-24 08:07:15',NULL),(5,3,'First Meet-Up','This is the first meet up','2025-10-29','12:30:00','Plateau State',NULL,'Workshop',NULL,NULL,'2025-10-28 10:24:31','2025-10-28 10:24:31',NULL);
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_members`
--

DROP TABLE IF EXISTS `group_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `user_id` int NOT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_membership` (`group_id`,`user_id`),
  KEY `idx_members_group` (`group_id`),
  KEY `idx_members_user` (`user_id`),
  KEY `idx_members_admin` (`is_admin`),
  CONSTRAINT `group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `discussion_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `group_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_members`
--

LOCK TABLES `group_members` WRITE;
/*!40000 ALTER TABLE `group_members` DISABLE KEYS */;
INSERT INTO `group_members` VALUES (1,1,7,1,'2025-11-01 13:50:28'),(2,2,7,1,'2025-11-01 13:50:28'),(3,3,7,1,'2025-11-01 13:50:28'),(4,4,7,1,'2025-11-01 13:50:28'),(5,5,7,1,'2025-11-01 13:50:28'),(6,6,7,1,'2025-11-01 13:50:28'),(7,7,7,1,'2025-11-01 13:50:28'),(8,8,7,1,'2025-11-01 13:50:28'),(16,1,1,0,'2025-11-01 13:50:28'),(17,1,2,0,'2025-11-01 13:50:28'),(18,1,3,0,'2025-11-01 13:50:28'),(19,1,4,0,'2025-11-01 13:50:28'),(20,1,5,0,'2025-11-01 13:50:28'),(21,2,1,0,'2025-11-01 13:50:28'),(22,2,2,0,'2025-11-01 13:50:28'),(23,2,4,0,'2025-11-01 13:50:28'),(24,3,1,0,'2025-11-01 13:50:28'),(25,3,3,0,'2025-11-01 13:50:28'),(26,3,5,0,'2025-11-01 13:50:28'),(27,1,10,0,'2025-11-09 12:40:23'),(28,4,16,0,'2025-11-16 14:19:26'),(29,1,16,0,'2025-11-16 14:19:32'),(31,1,21,0,'2025-11-21 17:48:52');
/*!40000 ALTER TABLE `group_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_messages`
--

DROP TABLE IF EXISTS `group_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `user_id` int NOT NULL,
  `parent_message_id` int DEFAULT NULL COMMENT 'For threaded replies',
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_messages_group` (`group_id`),
  KEY `idx_messages_user` (`user_id`),
  KEY `idx_messages_parent` (`parent_message_id`),
  KEY `idx_messages_created` (`created_at`),
  CONSTRAINT `group_messages_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `discussion_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `group_messages_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `group_messages_ibfk_3` FOREIGN KEY (`parent_message_id`) REFERENCES `group_messages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_messages`
--

LOCK TABLES `group_messages` WRITE;
/*!40000 ALTER TABLE `group_messages` DISABLE KEYS */;
INSERT INTO `group_messages` VALUES (1,1,1,NULL,'I have caterpillars destroying my tomato plants. What organic solution should I use?','2025-11-01 13:50:28','2025-11-01 13:50:28'),(2,1,7,1,'Try neem oil mixed with water (1:10 ratio). Spray in the evening when the sun is not too hot. It works very well!','2025-11-01 13:50:28','2025-11-01 13:50:28'),(3,1,2,1,'I used garlic water and it worked great! Crush 5-6 cloves of garlic, soak in 1 liter of water overnight, then spray.','2025-11-01 13:50:28','2025-11-01 13:50:28'),(4,1,3,NULL,'Where can I buy neem oil in Kano? Any recommendations for good shops?','2025-11-01 13:50:28','2025-11-01 13:50:28'),(5,1,7,3,'You can find it at Sabon Gari market or most agro-chemical shops. Ask for organic neem oil.','2025-11-01 13:50:28','2025-11-01 13:50:28'),(6,1,4,NULL,'Has anyone tried using ash for pest control? My grandfather used to do this.','2025-11-01 13:50:28','2025-11-01 13:50:28'),(7,1,5,4,'Yes! Wood ash works well for soft-bodied insects. Sprinkle it around the base of plants early morning when dew is still there.','2025-11-01 13:50:28','2025-11-01 13:50:28'),(8,2,2,NULL,'What is the best time to transplant rice seedlings? I am planting in Kano.','2025-11-01 13:50:28','2025-11-01 13:50:28'),(9,2,7,2,'The best time is when seedlings are 3-4 weeks old, usually 20-25 days after sowing. Make sure you have enough water in the field.','2025-11-01 13:50:28','2025-11-01 13:50:28'),(10,2,1,NULL,'How much fertilizer should I apply per hectare for rice farming?','2025-11-01 13:50:28','2025-11-01 13:50:28'),(11,2,7,1,'For NPK fertilizer, apply 200-300kg per hectare. Split it: 50% at planting, 25% at tillering, and 25% at panicle initiation.','2025-11-01 13:50:28','2025-11-01 13:50:28'),(12,2,4,NULL,'My rice plants are turning yellow. What could be the problem?','2025-11-01 13:50:28','2025-11-01 13:50:28'),(13,2,7,4,'Yellowing can be due to nitrogen deficiency or poor drainage. Check if water is stagnant and apply urea fertilizer.','2025-11-01 13:50:28','2025-11-01 13:50:28'),(14,3,3,NULL,'I want to install drip irrigation on my 2-hectare farm. What is the estimated cost?','2025-11-01 13:50:28','2025-11-01 13:50:28'),(15,3,7,3,'For 2 hectares, budget around ?300,000-?500,000 depending on the system quality. It will save you a lot of water and money in the long run!','2025-11-01 13:50:28','2025-11-01 13:50:28'),(16,3,5,3,'I installed mine last year. Initial cost is high but you recover it within 2-3 seasons through water savings and better yields.','2025-11-01 13:50:28','2025-11-01 13:50:28'),(17,3,1,NULL,'What crops are best for drip irrigation?','2025-11-01 13:50:28','2025-11-01 13:50:28'),(18,3,7,1,'Vegetables (tomatoes, peppers), fruits (watermelon), and crops like maize work very well with drip irrigation.','2025-11-01 13:50:28','2025-11-01 13:50:28'),(19,1,1,NULL,'Hi i am new','2025-11-01 14:18:40','2025-11-01 14:18:40'),(21,1,21,NULL,'Hello Welcome','2025-11-21 17:49:09','2025-11-21 17:49:09');
/*!40000 ALTER TABLE `group_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('Supplier','Market','Aggregator','Equipment Rental','Other') NOT NULL,
  `category` varchar(100) DEFAULT NULL COMMENT 'e.g., Seeds, Fertilizer, Produce Market',
  `address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `description` text,
  `operating_hours` varchar(255) DEFAULT NULL COMMENT 'e.g., Mon-Fri: 8AM-5PM',
  `services` text COMMENT 'Comma-separated list of services/products',
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` int DEFAULT NULL COMMENT 'User who added this location',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_location_type` (`type`),
  KEY `idx_location_state` (`state`),
  KEY `idx_location_city` (`city`),
  KEY `idx_location_active` (`is_active`),
  CONSTRAINT `locations_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,'Kano Seeds & Fertilizer Store','Supplier','Seeds & Fertilizer','Sabon Gari Market, Kano','Kano','Kano State',12.00220000,8.59190000,'08012345601',NULL,'Premium quality seeds and fertilizers for all crops','Mon-Sat: 8AM-6PM','Maize seeds, Rice seeds, Fertilizers, Pesticides',1,NULL,'2025-10-27 21:22:59','2025-10-27 21:22:59'),(2,'Dawanau International Market','Market','Grain Market','Dawanau, Kano','Kano','Kano State',11.98450000,8.49660000,'08012345602',NULL,'West Africa\'s largest grain market','Daily: 6AM-8PM','Grains, Produce, Wholesale',1,NULL,'2025-10-27 21:22:59','2025-10-27 21:22:59'),(3,'Kano Agro Aggregators Ltd','Aggregator','Produce Buyer','Industrial Area, Kano','Kano','Kano State',12.01800000,8.53700000,'08012345603',NULL,'We buy produce directly from farmers at fair prices','Mon-Fri: 9AM-5PM','Maize, Rice, Groundnut, Sorghum',1,NULL,'2025-10-27 21:22:59','2025-10-27 21:22:59'),(4,'Kaduna Farm Supplies','Supplier','Farm Inputs','Kawo Market, Kaduna','Kaduna','Kaduna State',10.52690000,7.43880000,'08012345604',NULL,'Complete farm input solutions','Mon-Sat: 8AM-6PM','Seeds, Tools, Fertilizers, Irrigation supplies',1,NULL,'2025-10-27 21:22:59','2025-10-27 21:22:59'),(5,'Kasuwan Barci Central Market','Market','Produce Market','Central Kaduna','Kaduna','Kaduna State',10.52330000,7.43830000,'08012345605',NULL,'Fresh produce and grains daily','Daily: 6AM-7PM','Vegetables, Grains, Fruits',1,NULL,'2025-10-27 21:22:59','2025-10-27 21:22:59'),(6,'Northern Harvest Aggregators','Aggregator','Produce Buyer','Sabon Tasha, Kaduna','Kaduna','Kaduna State',10.45120000,7.41220000,'08012345606',NULL,'Fair trade produce aggregation','Mon-Fri: 8AM-5PM','Tomatoes, Onions, Peppers, Grains',1,NULL,'2025-10-27 21:22:59','2025-10-27 21:22:59'),(7,'Jos Plateau Seeds','Supplier','Seeds','Terminus Market, Jos','Jos','Plateau State',9.89650000,8.85830000,'08012345607',NULL,'Quality vegetable and grain seeds','Mon-Sat: 9AM-6PM','Vegetable seeds, Grain seeds, Seedlings',1,NULL,'2025-10-27 21:22:59','2025-10-27 21:22:59'),(8,'Bukuru Equipment Rentals','Equipment Rental','Farm Equipment','Bukuru, Jos','Jos','Plateau State',9.79510000,8.85730000,'08012345608',NULL,'Affordable tractor and equipment rental','Daily: 7AM-6PM','Tractors, Ploughs, Harvesters, Planters',1,NULL,'2025-10-27 21:22:59','2025-10-27 21:22:59'),(9,'Jos Main Market','Market','General Market','Jos City Center','Jos','Plateau State',9.92520000,8.88310000,'08012345609',NULL,'Central market for produce and supplies','Daily: 6AM-8PM','Fresh produce, Grains, Tools',1,NULL,'2025-10-27 21:22:59','2025-10-27 21:22:59'),(10,'Sokoto Onion Aggregators','Aggregator','Onion Buyer','Sokoto North','Sokoto','Sokoto State',13.06220000,5.23390000,'08012345610',NULL,'Leading onion aggregator in the northwest','Mon-Sat: 7AM-6PM','Onions, Tomatoes, Peppers',1,NULL,'2025-10-27 21:22:59','2025-10-27 21:22:59'),(11,'Central Sokoto Farm Supplies','Supplier','Farm Inputs','Central Market, Sokoto','Sokoto','Sokoto State',13.05690000,5.24360000,'08012345611',NULL,'Your one-stop farm input shop','Mon-Sat: 8AM-6PM','Seeds, Fertilizers, Tools',1,NULL,'2025-10-27 21:22:59','2025-10-27 21:22:59'),(12,'Benue Valley Aggregators','Aggregator','Yam & Cassava Buyer','Makurdi','Makurdi','Benue State',7.73360000,8.52400000,'08012345612',NULL,'Premium yam and cassava aggregation','Mon-Fri: 8AM-5PM','Yam, Cassava, Rice, Soybeans',1,NULL,'2025-10-27 21:22:59','2025-10-27 21:22:59'),(13,'Makurdi Farm Equipment Center','Equipment Rental','Farm Equipment','North Bank, Makurdi','Makurdi','Benue State',7.75050000,8.54220000,'08012345613',NULL,'Modern farm equipment for rent','Mon-Sat: 7AM-6PM','Tractors, Harvesters, Processing equipment',1,NULL,'2025-10-27 21:22:59','2025-10-27 21:22:59'),(14,'Niger Seeds Co-operative','Supplier','Seeds','Minna Central','Minna','Niger State',9.61380000,6.54600000,'08012345614',NULL,'Cooperative seed distribution','Mon-Sat: 9AM-5PM','Rice seeds, Maize seeds, Groundnut seeds',1,NULL,'2025-10-27 21:22:59','2025-10-27 21:22:59'),(15,'Minna Produce Market','Market','Produce Market','Old Market, Minna','Minna','Niger State',9.60750000,6.54840000,'08012345615',NULL,'Daily fresh produce market','Daily: 6AM-7PM','Vegetables, Grains, Livestock',1,NULL,'2025-10-27 21:22:59','2025-10-27 21:22:59');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `market_prices`
--

DROP TABLE IF EXISTS `market_prices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `market_prices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `crop_name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `market_location` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `updated_by` (`updated_by`),
  KEY `idx_crop` (`crop_name`),
  KEY `idx_state` (`state`),
  CONSTRAINT `market_prices_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `market_prices`
--

LOCK TABLES `market_prices` WRITE;
/*!40000 ALTER TABLE `market_prices` DISABLE KEYS */;
INSERT INTO `market_prices` VALUES (1,'Rice',45000.00,'per bag (50kg)','Dawanau Market','Kano State',7,'2025-11-02 10:46:49','2025-11-02 10:46:49'),(2,'Maize',32000.00,'per bag (100kg)','Dawanau Market','Kano State',7,'2025-11-02 10:46:49','2025-11-02 10:46:49'),(3,'Yam',800.00,'per tuber','Sabon Gari Market','Kano State',7,'2025-11-02 10:46:49','2025-11-02 10:46:49'),(4,'Tomatoes',15000.00,'per basket','Kaduna Central Market','Kaduna State',7,'2025-11-02 10:46:49','2025-11-02 10:46:49'),(5,'Onions',25000.00,'per bag','Sokoto Market','Sokoto State',7,'2025-11-02 10:46:49','2025-11-02 10:46:49'),(6,'Groundnut',28000.00,'per bag (100kg)','Katsina Market','Katsina State',7,'2025-11-02 10:46:49','2025-11-02 10:46:49');
/*!40000 ALTER TABLE `market_prices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_reactions`
--

DROP TABLE IF EXISTS `message_reactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_reactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message_id` int NOT NULL,
  `user_id` int NOT NULL,
  `reaction_type` varchar(20) DEFAULT 'like',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_reaction` (`message_id`,`user_id`),
  KEY `idx_reactions_message` (`message_id`),
  KEY `idx_reactions_user` (`user_id`),
  CONSTRAINT `message_reactions_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `group_messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `message_reactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_reactions`
--

LOCK TABLES `message_reactions` WRITE;
/*!40000 ALTER TABLE `message_reactions` DISABLE KEYS */;
INSERT INTO `message_reactions` VALUES (1,1,2,'like','2025-11-01 13:50:32'),(2,1,3,'like','2025-11-01 13:50:32'),(3,1,4,'like','2025-11-01 13:50:32'),(4,2,1,'like','2025-11-01 13:50:32'),(5,2,3,'like','2025-11-01 13:50:32'),(6,3,1,'like','2025-11-01 13:50:32'),(7,7,2,'like','2025-11-01 13:50:32'),(8,7,3,'like','2025-11-01 13:50:32'),(9,8,1,'like','2025-11-01 13:50:32'),(10,9,2,'like','2025-11-01 13:50:32');
/*!40000 ALTER TABLE `message_reactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `content` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_messages_conversation` (`conversation_id`),
  KEY `idx_messages_sender` (`sender_id`),
  KEY `idx_messages_receiver` (`receiver_id`),
  KEY `idx_messages_read` (`is_read`),
  KEY `idx_messages_created` (`created_at`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,2,1,5,'hi',1,'2025-10-30 08:23:18'),(2,2,5,1,'hello',1,'2025-10-30 08:24:52'),(3,2,1,5,'hi',1,'2025-11-08 21:06:26'),(4,3,10,7,'hello mr kewa',0,'2025-11-09 12:39:59'),(5,5,17,16,'hello',1,'2025-11-16 14:25:46'),(6,5,16,17,'hi',0,'2025-11-16 14:26:36');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` enum('answer','crop_response','event_registration','upvote','mention') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(500) DEFAULT NULL,
  `related_id` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_read` (`user_id`,`is_read`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,'answer','New Answer to Your Question','Someone answered your question about cabbage growing','/questions/1',NULL,1,'2025-10-26 12:52:38'),(2,1,'crop_response','Crop Recommendation Ready','An officer has responded to your crop recommendation request','/crop-requests/1',NULL,1,'2025-10-26 12:52:38'),(3,1,'event_registration','Event Registration Confirmed','You are registered for Modern Farming Tools Workshop','/events/1',NULL,1,'2025-10-26 12:52:38'),(4,1,'answer','New Answer to Your Question','Samuel Komaiya answered your question: \"how to stop birds\"','/questions/1',1,1,'2025-10-26 17:40:56'),(5,6,'answer','New Answer to Your Question','Samuel Komaiya answered your question: \"Starting a Garden\"','/questions/5',5,0,'2025-10-26 18:03:38'),(6,2,'answer','New Answer to Your Question','Aisha Abubakar answered your question: \"How to make cabbages big\"','/questions/2',2,0,'2025-10-28 16:46:21'),(7,10,'event_registration','Event Registration Confirmed','You are registered for \"Organic Pest Control Seminar\" on November 25, 2025 at 14:00:00','/events/2',2,0,'2025-11-09 12:40:42'),(8,1,'crop_response','Crop Recommendation Ready','Samuel Komaiya has responded to your crop recommendation request for Bauchi State','/crop-requests/2',2,1,'2025-11-10 18:28:53'),(9,14,'answer','New Answer to Your Question','Luqman Amir answered your question: \"Too much pest this year\"','/questions/12',12,0,'2025-11-16 14:16:53'),(10,16,'event_registration','Event Registration Confirmed','You are registered for \"Modern Farming Tools Workshop\" on November 20, 2025 at 09:00:00','/events/1',1,1,'2025-11-16 14:20:14'),(11,16,'crop_response','Crop Recommendation Ready','Fadullahi Ismail has responded to your crop recommendation request for Jigawa State','/crop-requests/4',4,1,'2025-11-16 14:25:25'),(12,16,'answer','New Answer to Your Question','Abubakar Ahmad answered your question: \"Animal farming\"','/questions/13',13,0,'2025-11-21 17:22:04'),(13,16,'answer','New Answer to Your Question','Abubakar Ahmad answered your question: \"Animal farming\"','/questions/13',13,0,'2025-11-21 17:55:34');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_tags`
--

DROP TABLE IF EXISTS `question_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `tag` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `question_tags_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_tags`
--

LOCK TABLES `question_tags` WRITE;
/*!40000 ALTER TABLE `question_tags` DISABLE KEYS */;
INSERT INTO `question_tags` VALUES (5,1,'Maize'),(6,1,'Harvesting'),(7,2,'Cabbage'),(8,3,'Rice'),(9,3,'Rainy Season'),(10,4,'snail'),(11,4,'Pest Control'),(12,5,'Gardening'),(13,6,'Pest Control'),(14,7,'Organic Farming'),(18,11,'Pest Control'),(19,12,'Pest Control'),(20,13,'Soil Preparation'),(22,15,'Organic Farming');
/*!40000 ALTER TABLE `question_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_votes`
--

DROP TABLE IF EXISTS `question_votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_votes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `user_id` int NOT NULL,
  `vote_type` enum('upvote','downvote') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_question_vote` (`question_id`,`user_id`),
  KEY `idx_question_votes_question` (`question_id`),
  KEY `idx_question_votes_user` (`user_id`),
  CONSTRAINT `question_votes_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `question_votes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_votes`
--

LOCK TABLES `question_votes` WRITE;
/*!40000 ALTER TABLE `question_votes` DISABLE KEYS */;
/*!40000 ALTER TABLE `question_votes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `location` varchar(100) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `images` text,
  `votes` int DEFAULT '0',
  `views` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,1,'how to stop birds','Birds keep digging up my seeds i need to stop them',NULL,'Bauchi State',NULL,NULL,0,20,'2025-10-23 15:46:29','2025-11-15 17:31:13'),(2,2,'How to make cabbages big','I keep getting small cabbages how do i make them grow big',NULL,'Plateau State',NULL,NULL,1,61,'2025-10-23 18:02:21','2025-11-15 19:32:47'),(3,4,'Rice Not Growing','I heard that swampy places are good for rice but my rice got washed away',NULL,'FCT Abuja',NULL,NULL,0,15,'2025-10-26 17:32:22','2025-10-28 17:35:17'),(4,5,'Garden snail Issue','I keep having snails eat the leaves in my garden ',NULL,'Kano State',NULL,NULL,1,11,'2025-10-26 17:55:24','2025-11-10 18:36:35'),(5,6,'Starting a Garden','I want to start a new garden at my backyard what do i need',NULL,'FCT Abuja',NULL,NULL,0,7,'2025-10-26 18:01:23','2025-10-28 13:55:24'),(6,7,'Caterpillar issues','I have caterpillars all over my garden',NULL,'FCT Abuja',NULL,NULL,2,48,'2025-10-26 19:34:24','2025-11-15 19:32:32'),(7,10,'Farming now','How to farm in the Morden age ',NULL,'FCT Abuja',NULL,NULL,0,4,'2025-11-09 12:39:41','2025-11-10 13:10:39'),(11,8,'Horse Caterpillar ','I have been having a lot of horse caterpillar around ',NULL,'Adamawa State',NULL,'[\"/uploads/questions/questions-1763158583922-816576778.jpg\"]',0,2,'2025-11-14 22:16:33','2025-11-15 10:44:19'),(12,14,'Too much pest this year','I need more information about pest control ',NULL,'FCT Abuja',NULL,'[]',3,10,'2025-11-15 19:30:34','2025-11-16 14:19:47'),(13,16,'Animal farming','Can i use the dung from my animals to ferterlize',NULL,'Jigawa State',NULL,'[]',2,10,'2025-11-16 14:17:39','2025-11-21 17:55:34'),(15,21,'Unaware Of Farming','I am unaware of what to farm in November',NULL,'Adamawa State',NULL,'[]',0,1,'2025-11-21 17:55:11','2025-11-21 17:55:12');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recommended_crops`
--

DROP TABLE IF EXISTS `recommended_crops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recommended_crops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `crop_request_id` int NOT NULL,
  `crop_name` varchar(255) NOT NULL,
  `reason` text,
  `planting_tips` text,
  `expected_yield` varchar(255) DEFAULT NULL,
  `market_value` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `crop_request_id` (`crop_request_id`),
  CONSTRAINT `recommended_crops_ibfk_1` FOREIGN KEY (`crop_request_id`) REFERENCES `crop_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recommended_crops`
--

LOCK TABLES `recommended_crops` WRITE;
/*!40000 ALTER TABLE `recommended_crops` DISABLE KEYS */;
INSERT INTO `recommended_crops` VALUES (1,2,'Beans','it is a dicotyledon','plant in a row','1 year','#3500','2025-11-10 18:28:53'),(2,4,'rice','because rice wont grow now','','','','2025-11-16 14:25:25'),(3,4,'soguem','is best','','','','2025-11-16 14:25:25');
/*!40000 ALTER TABLE `recommended_crops` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_activity`
--

DROP TABLE IF EXISTS `user_activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_activity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `activity_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `activity_type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_date` (`user_id`,`activity_date`),
  KEY `idx_date` (`activity_date`),
  CONSTRAINT `user_activity_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_activity`
--

LOCK TABLES `user_activity` WRITE;
/*!40000 ALTER TABLE `user_activity` DISABLE KEYS */;
INSERT INTO `user_activity` VALUES (1,8,'2025-10-19 19:12:40','login'),(2,1,'2025-10-30 19:12:40','login'),(3,3,'2025-10-23 19:12:40','login'),(4,4,'2025-10-19 19:12:40','login'),(5,6,'2025-10-15 19:12:40','login'),(6,7,'2025-10-09 19:12:40','login'),(7,5,'2025-10-21 19:12:40','login'),(8,2,'2025-10-12 19:12:40','login');
/*!40000 ALTER TABLE `user_activity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_notes`
--

DROP TABLE IF EXISTS `user_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `group_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notes_user` (`user_id`),
  KEY `idx_notes_created` (`created_at`),
  KEY `idx_notes_updated` (`updated_at`),
  KEY `group_id` (`group_id`),
  KEY `idx_user_notes_group` (`user_id`,`group_id`),
  CONSTRAINT `user_notes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_notes_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `discussion_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notes`
--

LOCK TABLES `user_notes` WRITE;
/*!40000 ALTER TABLE `user_notes` DISABLE KEYS */;
INSERT INTO `user_notes` VALUES (1,1,'Pest Control Reminder','Use neem oil spray every 2 weeks for tomato plants. Mix 1:10 ratio with water.','2025-11-01 17:13:57','2025-11-01 17:13:57',NULL),(2,1,'Market Prices','Rice: ?45,000/bag\nMaize: ?32,000/bag\nYam: ?800/tuber\nChecked on Nov 15, 2024','2025-11-01 17:13:57','2025-11-01 17:13:57',NULL),(3,1,'Planting Schedule','Maize - Plant before end of March\nRice - Best time: May-June\nSoybeans - Plant in April','2025-11-01 17:13:57','2025-11-01 17:13:57',NULL);
/*!40000 ALTER TABLE `user_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `role` enum('Farmer','Extension Officer') NOT NULL DEFAULT 'Farmer',
  `location` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `bio` text COMMENT 'User biography',
  `phone` varchar(20) DEFAULT NULL COMMENT 'Phone number',
  `avatar_url` varchar(500) DEFAULT NULL COMMENT 'Profile picture URL',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_admin` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_user_location` (`location`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Aisha','Abubakar','aisha21@gmail.com',NULL,NULL,'Farmer','Bauchi State','$2b$10$GiEDeH0Y8qQWa9kP8CrK6.RA1HzXn3HaowcLGoVU9KwQszl3pTPXK',NULL,NULL,NULL,'2025-10-28 12:06:52','2025-10-28 13:32:32',0),(2,'Ruqayya','Ibrahim','ribrahim@gmail.com',NULL,NULL,'Farmer','Plateau State','$2b$10$7aOq8BbhYJAhVDUFoHbMceddeXMWZ6wkeaT9yOE7zEvDRCUuPA2ci',NULL,NULL,NULL,'2025-10-28 12:06:52','2025-10-28 13:32:32',0),(3,'Eyiniola','David','EyiniolaD@gmail.com',NULL,NULL,'Extension Officer','FCT Abuja','$2b$10$VYCNhmsHeMm4HiENBaqpE.C7VzeLrntm.1emI/7SAp/iCzX8.HJlq',NULL,NULL,NULL,'2025-11-10 08:15:18','2025-10-28 13:32:32',1),(4,'Samuel','Komaiya','samuelK@gmail.com',NULL,NULL,'Extension Officer','FCT Abuja','$2b$10$AkWAp0ex8UVgrVqx/SfZp.AYOHDZMDzWn0Oy6sW67SSmqkgfZM6cu',NULL,NULL,NULL,'2025-10-28 12:06:52','2025-10-28 13:32:32',0),(5,'Maryam','Idris','maryamI@gmail.com',NULL,NULL,'Farmer','Kano State','$2b$10$c.JEwB7uGrg2RcnxTa4a5Ojnu5BLorzSsjIRNY5CUz10BiCwMUAqy',NULL,NULL,NULL,'2025-10-28 12:06:52','2025-10-28 13:32:32',0),(6,'Halima','Idris','halimaI@gmail.com',NULL,NULL,'Farmer','FCT Abuja','$2b$10$x71vo0EbTo1l0oIWo1XuMOuiFrV4plPuCKiIdT1nkjj9iSgI0pukG',NULL,NULL,NULL,'2025-10-28 12:06:52','2025-10-28 13:32:32',0),(7,'Dauda','Kewa','daudaK@gmail.com',NULL,NULL,'Farmer','FCT Abuja','$2b$10$VVypqxN4Nm2eT6d5L3vKEuIetfiq4DsmTqq0Fl7at6Pp7J9dv45jW',NULL,NULL,NULL,'2025-10-28 12:06:52','2025-10-28 13:32:32',0),(8,'Hephzibah','Ofomi','hephzibahO@gmail.com',NULL,NULL,'Extension Officer','Adamawa State','$2b$10$cAkH21CNkzj3LOArG93sVOE3fviKlJz9hQxx64DB.XVOH8gK6DfnG',NULL,NULL,NULL,'2025-10-28 12:06:52','2025-10-28 13:32:32',0),(9,'Admin','User','ikewa@gmail.com',NULL,NULL,'Extension Officer','Kano State','$2b$10$LJ3dmiUpCF3M.Xj9I2I/auoGUwcGEj53Uzqq8ZwDd6lGILFy5LiVu',NULL,NULL,NULL,'2025-11-07 17:38:32','2025-11-07 17:38:32',1),(10,'Hassan','Luqman','hassanL@gmail.com',NULL,NULL,'Farmer','FCT Abuja','$2b$10$S0xdaWb4mdwnvx/OFv1ud.7.Y90Ej5jQqW.m6HniIpnn5NGth4efu',NULL,NULL,NULL,'2025-11-09 12:38:40','2025-11-09 12:38:40',0),(11,'Fadullah','Abdulazeez','fadhA@gmail.com',NULL,NULL,'Farmer','Bauchi State','$2b$10$FYuZ7rZckRb.o2qew/5oaOsvcwscly.dQ1EzaN5SSRRx.zDjXI2iW',NULL,NULL,NULL,'2025-11-15 11:27:02','2025-11-15 11:27:02',0),(12,'Aisha Ridwan ','Dantoro ','aishatoro20@gmail.com',NULL,NULL,'Farmer','Bauchi State','$2b$10$VZ54Ej9YhvU5XY2kZnzCceUwFcjyvSizsDxw21hXNY1AJ0ZJZgmsq',NULL,NULL,NULL,'2025-11-15 16:47:16','2025-11-15 16:47:16',0),(13,'Khadija ','Kewa','khadijakewa@outlook.com',NULL,NULL,'Farmer','FCT Abuja','$2b$10$rAD7pbCWOkK2sHNSiZkHHO6Sx4KJnsMnLsq3jxDvdgI145vOj6lUu',NULL,NULL,NULL,'2025-11-15 18:30:42','2025-11-15 18:30:42',0),(14,'Dauda','Kewa','daudakewa@yahoo.com',NULL,NULL,'Farmer','FCT Abuja','$2b$10$5OwiOfXv96bfjTbErs7tRODWCbxU1vxp8O8vzJvn7k0D7D9kO4Szy',NULL,NULL,NULL,'2025-11-15 19:21:16','2025-11-15 19:21:16',0),(15,'fatimah','Kewa','fatimahkewa@gmail.com',NULL,NULL,'Farmer','FCT Abuja','$2b$10$1PRlAMue5CkgOkVhMZQ4wOcY0IduhxWsMNDjcaTSBrNKbDgmirY3a',NULL,NULL,NULL,'2025-11-15 20:59:21','2025-11-15 20:59:21',0),(16,'Luqman','Amir','luqmanA@gmail.com',NULL,NULL,'Farmer','Jigawa State','$2b$10$DfeRRBNZdsaij7eUm4VolOUoOvycgZsMNbQe1IoNDD.vo9pOhPH5m',NULL,NULL,NULL,'2025-11-16 14:14:25','2025-11-16 14:14:25',0),(17,'Fadullahi','Ismail','fadhI@gmail.com',NULL,NULL,'Extension Officer','Zamfara State','$2b$10$kqqYUWEjmAZ6ywdnpUjZsOpIcVyKbKzLoDTI3we64oQSV.oruApai',NULL,NULL,NULL,'2025-11-16 14:15:34','2025-11-16 14:15:34',0),(18,'Saleh','Abdullahi ','salehmaikudi324@gmail.com',NULL,NULL,'Farmer','Bauchi State','$2b$10$0bqJKrzhuJmddf3z5pahBeOw2wECD7i6kIgb8vZNkgx/mkvs2u5jS',NULL,NULL,NULL,'2025-11-17 13:03:18','2025-11-17 13:03:18',0),(21,'Abubakar','Ahmad','abubakarA@gmail.com',NULL,NULL,'Farmer','Adamawa State','$2b$10$fFJMdPBWVHkNmhDsocqtC.q.TWVPHLhDmm/wgfRWpCykAEtToqquC',NULL,NULL,NULL,'2025-11-21 17:45:25','2025-11-21 17:45:25',0),(22,'Ismail','Muhammad','ismailM@gmail.com',NULL,NULL,'Extension Officer','Nasarawa State','$2b$10$EOExYBJX03a/0oMqBws7LOjzW/emd6iI.MxTiS47iRBnN7weFZb5m',NULL,NULL,NULL,'2025-11-21 17:59:09','2025-11-21 17:59:09',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ussd_logs`
--

DROP TABLE IF EXISTS `ussd_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ussd_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(100) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `user_input` text,
  `menu_level` varchar(100) DEFAULT NULL,
  `response_sent` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_phone` (`phone_number`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ussd_logs`
--

LOCK TABLES `ussd_logs` WRITE;
/*!40000 ALTER TABLE `ussd_logs` DISABLE KEYS */;
INSERT INTO `ussd_logs` VALUES (1,'test-session-001','+2348012345678','',NULL,NULL,'2025-11-02 21:05:12'),(2,'test-session-001','+2348012345678',NULL,NULL,'CON Welcome to AgriConnect\nPlease register/login first:\n1. View Crop Prices\n2. Weather Information\n3. Ask a Question\n4. View My Questions\n5. Upcoming Events\n6. Book Consultation\n7. Register/Login\n0. Exit','2025-11-02 21:05:12'),(3,'test-session-001','+2348012345678','1',NULL,NULL,'2025-11-02 21:06:39'),(4,'test-session-001','+2348012345678',NULL,NULL,'CON Select Crop:\n1. Rice\n2. Maize\n3. Yam\n4. Tomatoes\n5. Onions\n0. Back','2025-11-02 21:06:39'),(5,'test-session-001','+2348012345678','2',NULL,NULL,'2025-11-02 21:06:57'),(6,'test-session-001','+2348012345678',NULL,NULL,'END Maize Prices:\n\nDawanau Market\nN32000.00 per bag (100kg)\nUpdated: 11/2/2025\n\n','2025-11-02 21:06:57'),(7,'test-session-001','+2348012345678','2*1',NULL,NULL,'2025-11-02 21:07:19'),(8,'test-session-001','+2348012345678',NULL,NULL,'END Rice Prices:\n\nDawanau Market\nN45000.00 per bag (50kg)\nUpdated: 11/2/2025\n\n','2025-11-02 21:07:19'),(9,'test-session-001','+2348012345678','2*3',NULL,NULL,'2025-11-02 21:07:30'),(10,'test-session-001','+2348012345678',NULL,NULL,'END Yam Prices:\n\nSabon Gari Market\nN800.00 per tuber\nUpdated: 11/2/2025\n\n','2025-11-02 21:07:30');
/*!40000 ALTER TABLE `ussd_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ussd_sessions`
--

DROP TABLE IF EXISTS `ussd_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ussd_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(100) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `user_id` int DEFAULT NULL,
  `current_menu` varchar(100) DEFAULT 'main',
  `menu_data` text COMMENT 'JSON data for menu state',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_phone` (`phone_number`),
  KEY `idx_expires` (`expires_at`),
  CONSTRAINT `ussd_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ussd_sessions`
--

LOCK TABLES `ussd_sessions` WRITE;
/*!40000 ALTER TABLE `ussd_sessions` DISABLE KEYS */;
INSERT INTO `ussd_sessions` VALUES (1,'test-session-001','+2348012345678',NULL,'crop_prices',NULL,'2025-11-02 21:05:12','2025-11-02 21:06:39','2025-11-02 21:10:12');
/*!40000 ALTER TABLE `ussd_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `votes`
--

DROP TABLE IF EXISTS `votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `votes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `votable_type` enum('question','answer') NOT NULL,
  `votable_id` int NOT NULL,
  `vote_type` enum('up','down') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_vote` (`user_id`,`votable_type`,`votable_id`),
  CONSTRAINT `votes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `votes`
--

LOCK TABLES `votes` WRITE;
/*!40000 ALTER TABLE `votes` DISABLE KEYS */;
INSERT INTO `votes` VALUES (1,6,'question',1,'up','2025-10-18 08:15:35'),(2,1,'question',2,'up','2025-10-23 22:18:10'),(3,1,'answer',1,'up','2025-10-23 22:18:16'),(4,1,'question',6,'up','2025-10-26 20:05:53'),(5,1,'answer',3,'up','2025-10-28 16:46:43'),(12,4,'question',4,'up','2025-11-10 18:36:35'),(13,12,'question',6,'up','2025-11-15 16:48:10'),(14,12,'question',12,'up','2025-11-15 19:32:14'),(15,15,'question',12,'up','2025-11-15 21:00:21'),(16,16,'question',12,'up','2025-11-16 14:16:23'),(18,21,'question',13,'up','2025-11-21 17:55:20');
/*!40000 ALTER TABLE `votes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24 11:43:47
