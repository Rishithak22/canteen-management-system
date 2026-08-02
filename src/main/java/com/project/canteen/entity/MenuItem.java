package com.project.canteen.entity;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


@Entity
@Table(name = "menu_item")
public class MenuItem {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	private String name;
	
	private String description;
	
	private Boolean veg;
	
	private Double rating;
	
	private String ratingCount;
	
	private Boolean bestseller;
	
	private Boolean available;

	private String category;

	private BigDecimal price;

	private String imageUrl;
	
	public MenuItem() {
		
	}
	

	public MenuItem(Integer id, String name, String description, Boolean veg, Double rating, String ratingCount,
		Boolean bestseller, Boolean available, String category, BigDecimal price, String imageUrl) {
		super();
		this.id = id;
		this.name = name;
		this.description = description;
		this.veg = veg;
		this.rating = rating;
		this.ratingCount = ratingCount;
		this.bestseller = bestseller;
		this.available = available;
		this.category = category;
		this.price = price;
		this.imageUrl = imageUrl;
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Boolean getVeg() {
		return veg;
	}

	public void setVeg(Boolean veg) {
		this.veg = veg;
	}

	public Double getRating() {
		return rating;
	}

	public void setRating(Double rating) {
		this.rating = rating;
	}

	public String getRatingCount() {
		return ratingCount;
	}

	public void setRatingCount(String ratingCount) {
		this.ratingCount = ratingCount;
	}

	public Boolean getBestseller() {
		return bestseller;
	}

	public void setBestseller(Boolean bestseller) {
		this.bestseller = bestseller;
	}

	public Boolean getAvailable() {
		return available;
	}

	public void setAvailable(Boolean available) {
		this.available = available;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	
	
}
